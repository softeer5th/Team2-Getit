package com.softeer5.uniro_backend.route.service;

import static com.softeer5.uniro_backend.common.constant.UniroConst.*;
import static com.softeer5.uniro_backend.common.error.ErrorCode.*;

import com.softeer5.uniro_backend.admin.annotation.RevisionOperation;
import com.softeer5.uniro_backend.admin.entity.RevisionOperationType;
import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.NodeNotFoundException;
import com.softeer5.uniro_backend.common.exception.custom.RouteCalculationException;
import com.softeer5.uniro_backend.common.exception.custom.SameStartAndEndPointException;
import com.softeer5.uniro_backend.common.exception.custom.UnreachableDestinationException;
import com.softeer5.uniro_backend.common.utils.GeoUtils;
import com.softeer5.uniro_backend.external.MapClient;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.node.repository.NodeRepository;
import com.softeer5.uniro_backend.route.dto.request.CreateRouteReqDTO;
import com.softeer5.uniro_backend.route.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.route.dto.response.FastestRouteResDTO;
import com.softeer5.uniro_backend.route.dto.response.RouteDetailResDTO;
import com.softeer5.uniro_backend.route.dto.response.RouteInfoResDTO;
import com.softeer5.uniro_backend.route.entity.DirectionType;
import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.repository.RouteRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.index.strtree.STRtree;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteCalculationService {
    private final RouteRepository routeRepository;
    private final MapClient mapClient;
    private final NodeRepository nodeRepository;

    @AllArgsConstructor
    private class CostToNextNode implements Comparable<CostToNextNode> {
        private double cost;
        private Node nextNode;

        @Override
        public int compareTo(CostToNextNode o) {
            return Double.compare(this.cost, o.cost);
        }
    }

    public FastestRouteResDTO calculateFastestRoute(Long univId, Long startNodeId, Long endNodeId){

        if(startNodeId.equals(endNodeId)){
            throw new SameStartAndEndPointException("Start and end nodes cannot be the same", SAME_START_AND_END_POINT);
        }

        //인접 리스트
        Map<Long, List<Route>> adjMap = new HashMap<>();
        Map<Long, Node> nodeMap = new HashMap<>();

        routeRepository.findAllRouteByUnivIdWithNodes(univId).forEach(route -> {
            adjMap.computeIfAbsent(route.getNode1().getId(), k -> new ArrayList<>()).add(route);
            adjMap.computeIfAbsent(route.getNode2().getId(), k -> new ArrayList<>()).add(route);

            nodeMap.putIfAbsent(route.getNode1().getId(), route.getNode1());
            nodeMap.putIfAbsent(route.getNode2().getId(), route.getNode2());
        });


        Node startNode = nodeMap.get(startNodeId);
        Node endNode = nodeMap.get(endNodeId);

        //길찾기 알고리즘 수행
        Map<Long, Route> prevRoute = findFastestRoute(startNode, endNode, adjMap);

        //길찾기 경로 결과 정리
        List<Route> shortestRoutes = reorderRoute(startNode, endNode, prevRoute);

        boolean hasCaution = false;
        double totalCost = 0.0;
        double totalDistance = 0.0;

        List<RouteInfoResDTO> routeInfoDTOS = new ArrayList<>();
        Node currentNode = startNode;
        // 외부 변수를 수정해야하기 때문에 for-loop문 사용
        for (Route route : shortestRoutes) {
            totalCost += route.getCost();
            totalDistance += calculateDistance(route);

            if (!route.getCautionFactors().isEmpty()) {
                hasCaution = true;
            }

            Node firstNode = route.getNode1();
            Node secondNode = route.getNode2();
            if(currentNode.getId().equals(secondNode.getId())){
                Node temp = firstNode;
                firstNode = secondNode;
                secondNode = temp;
            }

            routeInfoDTOS.add(RouteInfoResDTO.of(route, firstNode, secondNode));
        }

        List<RouteDetailResDTO> details = getRouteDetail(startNode, endNode, shortestRoutes);

        return FastestRouteResDTO.of(hasCaution, totalDistance, totalCost, routeInfoDTOS, details);
    }

    private Map<Long, Route> findFastestRoute(Node startNode, Node endNode, Map<Long, List<Route>> adjMap){
        //key : nodeId, value : 최단거리 중 해당 노드를 향한 route
        Map<Long, Route> prevRoute = new HashMap<>();
        // startNode로부터 각 노드까지 걸리는 cost를 저장하는 자료구조
        Map<Long, Double> costMap = new HashMap<>();
        PriorityQueue<CostToNextNode> pq = new PriorityQueue<>();
        pq.add(new CostToNextNode(0.0, startNode));
        costMap.put(startNode.getId(), 0.0);

        // 길찾기 알고리즘
        while(!pq.isEmpty()){
            CostToNextNode costToNextNode = pq.poll();
            double currentDistance = costToNextNode.cost;
            Node currentNode = costToNextNode.nextNode;
            if (currentNode.getId().equals(endNode.getId())) break;
            if(costMap.containsKey(currentNode.getId())
                    && currentDistance > costMap.get(currentNode.getId())) continue;

            for(Route route : adjMap.getOrDefault(currentNode.getId(), Collections.emptyList())){
                double newDistance = currentDistance + route.getCost();
                Node nextNode = route.getNode1().getId().equals(currentNode.getId())?route.getNode2():route.getNode1();
                if(!costMap.containsKey(nextNode.getId()) || costMap.get(nextNode.getId()) > newDistance){
                    costMap.put(nextNode.getId(), newDistance);
                    pq.add(new CostToNextNode(newDistance, nextNode));
                    prevRoute.put(nextNode.getId(), route);
                }
            }
        }
        //길 없는 경우
        if(!costMap.containsKey(endNode.getId())){
            throw new UnreachableDestinationException("Unable to find a valid route", ErrorCode.FASTEST_ROUTE_NOT_FOUND);
        }

        return prevRoute;
    }

    // 길찾기 결과를 파싱하여 출발지 -> 도착지 형태로 재배열하는 메서드
    private List<Route> reorderRoute(Node startNode, Node endNode, Map<Long, Route> prevRoute){
        List<Route> shortestRoutes = new ArrayList<>();
        Node currentNode = endNode;

        //endNode부터 역순회하여 배열에 저장
        while(!currentNode.getId().equals(startNode.getId())){
            Route previousRoute = prevRoute.get(currentNode.getId());
            shortestRoutes.add(previousRoute);
            currentNode = previousRoute.getNode1().getId().equals(currentNode.getId()) ? previousRoute.getNode2() : previousRoute.getNode1();
        }

        //이후 reverse를 통해 시작점 -> 도착점 방향으로 재정렬
        Collections.reverse(shortestRoutes);

        return shortestRoutes;
    }

    // 두 route 간의 각도를 통한 계산으로 방향성을 정하는 메서드
    private DirectionType calculateDirection(Node secondNode, Route inBoundRoute, Route outBoundRoute) {
        Node firstNode = inBoundRoute.getNode1().equals(secondNode) ? inBoundRoute.getNode2() : inBoundRoute.getNode1();
        Node thirdNode = outBoundRoute.getNode1().equals(secondNode) ? outBoundRoute.getNode2() : outBoundRoute.getNode1();

        Point p1 = firstNode.getCoordinates();
        Point p2 = secondNode.getCoordinates();
        Point p3 = thirdNode.getCoordinates();

        double v1x = p2.getX() - p1.getX();
        double v1y = p2.getY() - p1.getY();

        double v2x = p3.getX() - p2.getX();
        double v2y = p3.getY() - p2.getY();

        double dotProduct = (v1x * v2x) + (v1y * v2y);
        double magnitudeV1 = Math.sqrt(v1x * v1x + v1y * v1y);
        double magnitudeV2 = Math.sqrt(v2x * v2x + v2y * v2y);

        double cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);
        double angle = Math.toDegrees(Math.acos(cosTheta));

        double crossProduct = (v1x * v2y) - (v1y * v2x);

        if (angle < 30) {
            return DirectionType.STRAIGHT;
        } else if (angle >= 30 && angle < 150) {
            return (crossProduct > 0) ? DirectionType.RIGHT : DirectionType.LEFT;
        } else if (angle >= 150 && angle < 180) {
            return (crossProduct > 0) ? DirectionType.SHARP_RIGHT : DirectionType.SHARP_LEFT;
        } else {
            return DirectionType.STRAIGHT;
        }
    }

    // 길의 길이를 리턴하는 메서드
    private double calculateDistance(Route route) {
        Point p1 = route.getNode1().getCoordinates();
        Point p2 = route.getNode2().getCoordinates();

        double deltaX = p2.getX() - p1.getX();
        double deltaY = p2.getY() - p1.getY();

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    // 길 상세정보를 추출하는 메서드
    private List<RouteDetailResDTO> getRouteDetail(Node startNode, Node endNode, List<Route> shortestRoutes){
        List<RouteDetailResDTO> details = new ArrayList<>();
        double accumulatedDistance = 0.0;
        Node now = startNode;
        Map<String,Double> checkPointNodeCoordinates = startNode.getXY();
        DirectionType checkPointType = DirectionType.STRAIGHT;

        // 길찾기 결과 상세정보 정리
        for(int i=0;i<shortestRoutes.size();i++){
            Route nowRoute = shortestRoutes.get(i);
            Node nxt = nowRoute.getNode1().equals(now) ? nowRoute.getNode2() : nowRoute.getNode1();
            accumulatedDistance += calculateDistance(nowRoute);

            if(!nowRoute.getCautionFactors().isEmpty()){
                details.add(RouteDetailResDTO.of(accumulatedDistance - calculateDistance(nowRoute)/2, checkPointType, checkPointNodeCoordinates));
                accumulatedDistance = calculateDistance(nowRoute)/2;
                checkPointNodeCoordinates = getCenter(now, nxt);
                checkPointType = DirectionType.CAUTION;
            }

            if(nxt.equals(endNode)){
                details.add(RouteDetailResDTO.of(accumulatedDistance, checkPointType, checkPointNodeCoordinates));
                details.add(RouteDetailResDTO.of(0, DirectionType.FINISH, nxt.getXY()));
                break;
            }
            if(nxt.isCore()){
                DirectionType directionType = calculateDirection(nxt, nowRoute, shortestRoutes.get(i+1));
                if(directionType == DirectionType.STRAIGHT){
                    now = nxt;
                    continue;
                }
                details.add(RouteDetailResDTO.of(accumulatedDistance, checkPointType, checkPointNodeCoordinates));
                checkPointNodeCoordinates = nxt.getXY();
                checkPointType = directionType;
                accumulatedDistance = 0.0;
            }

            now = nxt;
        }

        return details;
    }

    private Map<String,Double> getCenter(Node n1, Node n2){
        return Map.of("lat", (n1.getCoordinates().getY() + n2.getCoordinates().getY())/2
                , "lng", (n1.getCoordinates().getX() + n2.getCoordinates().getX())/2);
    }

    @Transactional
    @RevisionOperation(RevisionOperationType.UPDATE_ROUTE)
    public void createRoute(Long univId, CreateRoutesReqDTO requests){
        List<Node> nodes = checkRouteCross(univId, requests.getStartNodeId(), requests.getEndNodeId(), requests.getCoordinates());
        mapClient.fetchHeights(nodes);
        createLinkedRouteAndSave(univId,nodes);
    }

    private void createLinkedRouteAndSave(Long univId, List<Node> nodes) {
        GeometryFactory geometryFactory = GeoUtils.getInstance();
        Set<String> nodeSet = new HashSet<>();
        List<Node> nodeForSave = new ArrayList<>();
        List<Route> routeForSave = new ArrayList<>();
        for(int i=1;i<nodes.size();i++){
            Node now = nodes.get(i);
            Node prev = nodes.get(i-1);
            routeForSave.add(
                Route.builder()
                    .cost(calculateCost(prev,now))
                    .path(geometryFactory.createLineString(
                            new Coordinate[] {prev.getCoordinates().getCoordinate(), now.getCoordinates().getCoordinate()}))
                    .node1(prev)
                    .node2(now)
                    .cautionFactors(Collections.EMPTY_SET)
                    .dangerFactors(Collections.EMPTY_SET)
                    .univId(univId).build());
            if(!nodeSet.contains(getNodeKey(new Coordinate(now.getCoordinates().getX(), now.getCoordinates().getY())))){
                nodeForSave.add(now);
                nodeSet.add(getNodeKey(new Coordinate(now.getCoordinates().getX(), now.getCoordinates().getY())));
            }
        }
        nodeRepository.saveAll(nodeForSave);
        routeRepository.saveAll(routeForSave);
    }

    private double calculateCost(Node prev, Node now) {
        double lng1 = prev.getCoordinates().getX();
        double lat1 = prev.getCoordinates().getY();
        double lng2 = now.getCoordinates().getX();
        double lat2 = now.getCoordinates().getY();

        double dLat = (lat2 - lat1) * METERS_PER_DEGREE;

        double avgLat = (lat1 + lat2) / 2.0;
        double dLng = (lng2 - lng1) * METERS_PER_DEGREE * Math.cos(Math.toRadians(avgLat));

        double distance = Math.sqrt(dLat * dLat + dLng * dLng);

        return distance * SECONDS_PER_MITER;
    }

    // TODO: 모든 점이 아니라 request 값의 MBR 영역만 불러오면 좋을 것 같다.  <- 추가 검증 필요
    // TODO: 캐시 사용 검토
    public List<Node> checkRouteCross(Long univId, Long startNodeId, Long endNodeId, List<CreateRouteReqDTO> requests) {
        LinkedList<Node> createdNodes = new LinkedList<>();

        Map<String, Node> nodeMap = new HashMap<>();
        STRtree strTree = new STRtree();
        GeometryFactory geometryFactory = GeoUtils.getInstance();

        int startNodeCount = 0;
        int endNodeCount = 0;

        List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);
        for (Route route : routes) {
            Node node1 = route.getNode1();
            Node node2 = route.getNode2();

            LineString line = geometryFactory.createLineString(
                new Coordinate[] {node1.getCoordinates().getCoordinate(), node2.getCoordinates().getCoordinate()});
            Envelope envelope = line.getEnvelopeInternal();  // MBR 생성
            strTree.insert(envelope, line);

            nodeMap.putIfAbsent(node1.getNodeKey(), node1);
            nodeMap.putIfAbsent(node2.getNodeKey(), node2);

            if(startNodeId.equals(node1.getId()) || startNodeId.equals(node2.getId())) startNodeCount++;
            if(endNodeId != null){
                if(endNodeId.equals(node1.getId()) || endNodeId.equals(node2.getId())){
                    endNodeCount++;
                }
            }
        }

        // 1. 첫번째 노드:
        // 서브 -> 코어 : 처리 필요
        // 코어 -> 코어 : 처리 필요 X
        // 코어 -> 서브 : 불가한 케이스
        CreateRouteReqDTO startCoordinate = requests.get(0);
        Node startNode = nodeMap.get(getNodeKey(new Coordinate(startCoordinate.getLng(), startCoordinate.getLat())));

        if (startNode == null) {
            throw new NodeNotFoundException("Start Node Not Found", NODE_NOT_FOUND);
        }

        if(!startNode.isCore() && startNodeCount == CORE_NODE_CONDITION - 1){
            startNode.setCore(true);
        }
        createdNodes.add(startNode);

        for (int i = 1; i < requests.size(); i++) {
            CreateRouteReqDTO cur = requests.get(i);

            // 정확히 그 점과 일치하는 노드가 있는지 확인
            Node curNode = nodeMap.get(getNodeKey(new Coordinate(cur.getLng(), cur.getLat())));
            if(curNode != null){
                createdNodes.add(curNode);
                if(i == requests.size() - 1 && endNodeCount < CORE_NODE_CONDITION - 1){  // 마지막 노드일 경우, 해당 노드가 끝점일 경우
                    continue;
                }

                curNode.setCore(true);
                continue;
            }

            Coordinate coordinate = new Coordinate(cur.getLng(), cur.getLat());
            curNode = Node.builder()
                .coordinates(geometryFactory.createPoint(coordinate))
                .isCore(false)
                .univId(univId)
                .build();

            createdNodes.add(curNode);
        }

        // 2. 두번째 노드 ~ N-1번째 노드
        // 현재 노드와 다음 노드가 기존 route와 겹치는지 확인
        checkForRouteIntersections(createdNodes, strTree, nodeMap);

        // 3. 자가 크로스 or 중복점 (첫점과 끝점 동일) 확인
        List<Node> checkedSelfRouteCrossNodes = checkSelfRouteCross(createdNodes);

        return checkedSelfRouteCrossNodes;
    }

    private void checkForRouteIntersections(List<Node> nodes, STRtree strTree, Map<String, Node> nodeMap) {
        ListIterator<Node> iterator = nodes.listIterator();
        if (!iterator.hasNext()) return;
        Node prev = iterator.next();

        while (iterator.hasNext()) {
            Node cur = iterator.next();
            LineString intersectLine = findIntersectLineString(prev.getCoordinates().getCoordinate(), cur.getCoordinates()
                .getCoordinate(), strTree);
            if (intersectLine != null) {
                Node midNode = getClosestNode(intersectLine, prev, cur, nodeMap);
                midNode.setCore(true);
                iterator.previous(); // 이전으로 이동
                iterator.add(midNode); // 이전 위치에 삽입
                cur = midNode;
            }
            prev = cur;
        }
    }


    private List<Node> checkSelfRouteCross(List<Node> nodes) {

        GeometryFactory geometryFactory = GeoUtils.getInstance();

        if(nodes.get(0).getCoordinates().equals(nodes.get(nodes.size()-1).getCoordinates())){
            throw new SameStartAndEndPointException("Start and end nodes cannot be the same", SAME_START_AND_END_POINT);
        }

        STRtree strTree = new STRtree();
        Map<String, Node> nodeMap = new HashMap<>();

        for (int i = 0; i < nodes.size() - 1; i++) {
            Node curNode = nodes.get(i);
            Node nextNode = nodes.get(i + 1);
            LineString line = geometryFactory.createLineString(
                new Coordinate[] {curNode.getCoordinates().getCoordinate(), nextNode.getCoordinates().getCoordinate()});
            Envelope envelope = line.getEnvelopeInternal();  // MBR 생성
            strTree.insert(envelope, line);

            nodeMap.putIfAbsent(curNode.getNodeKey(), curNode);
            nodeMap.putIfAbsent(nextNode.getNodeKey(), nextNode);
        }

        for (int i = 0; i < nodes.size() - 1; i++) {
            Node curNode = nodes.get(i);
            Node nextNode = nodes.get(i + 1);

            LineString intersectLine = findIntersectLineString(curNode.getCoordinates().getCoordinate(),
                nextNode.getCoordinates().getCoordinate(), strTree);

            if (intersectLine != null) {
                Coordinate[] coordinates = intersectLine.getCoordinates();

                double distance1 =
                    curNode.getCoordinates().getCoordinate().distance(coordinates[0]) + nextNode.getCoordinates()
                        .getCoordinate()
                        .distance(coordinates[0]);
                double distance2 =
                    curNode.getCoordinates().getCoordinate().distance(coordinates[1]) + nextNode.getCoordinates()
                        .getCoordinate()
                        .distance(coordinates[1]);

                Node midNode;

                if (distance1 <= distance2) {
                    midNode = nodeMap.get(getNodeKey(coordinates[0]));
                } else {
                    midNode = nodeMap.get(getNodeKey(coordinates[1]));
                }

                midNode.setCore(true);

                nodes.add(midNode);
            }
        }

        return nodes;
    }

    private LineString findIntersectLineString(Coordinate start, Coordinate end, STRtree strTree) {
        GeometryFactory geometryFactory = GeoUtils.getInstance();
        LineString newLine = geometryFactory.createLineString(new Coordinate[] {start, end});
        Envelope searchEnvelope = newLine.getEnvelopeInternal();

        // 1️⃣ 후보 선분들 검색 (MBR이 겹치는 선분만 가져옴)
        List<?> candidates = strTree.query(searchEnvelope);

        LineString closestLine = null;
        double minDistance = Double.MAX_VALUE;

        // 2️⃣ 실제로 선분이 겹치는지 확인
        for (Object obj : candidates) {
            LineString existingLine = (LineString)obj;

            // 동일한 선이면 continue
            if(existingLine.equalsTopo(newLine)){
                continue;
            }

            if (existingLine.intersects(newLine)) {
                Geometry intersection = existingLine.intersection(newLine);

                Coordinate intersectionCoord = null;

                if (intersection instanceof Point) {
                    intersectionCoord = ((Point) intersection).getCoordinate();

                    // 교차점이 start 또는 end 좌표와 동일하면 continue
                    if (intersectionCoord.equals2D(start) || intersectionCoord.equals2D(end)) {
                        continue;
                    }

                    double distance = start.distance(intersectionCoord);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestLine = existingLine;
                    }
                }
                else if (intersection instanceof LineString) {
                    throw new RouteCalculationException("intersection is only allowed by point", INTERSECTION_ONLY_ALLOWED_POINT);
                }

            }
        }

        return closestLine;  // 겹치는 선분이 없으면 null 반환
    }

    private Node getClosestNode(LineString intersectLine, Node start, Node end, Map<String, Node> nodeMap) {
        GeometryFactory geometryFactory = GeoUtils.getInstance();
        Coordinate[] coordinates = intersectLine.getCoordinates();

        double distance1 = start.getCoordinates().getCoordinate().distance(coordinates[0]) +
            end.getCoordinates().getCoordinate().distance(coordinates[0]);
        double distance2 = start.getCoordinates().getCoordinate().distance(coordinates[1]) +
            end.getCoordinates().getCoordinate().distance(coordinates[1]);

        return nodeMap.getOrDefault(
            getNodeKey(distance1 <= distance2 ? coordinates[0] : coordinates[1]),
            Node.builder().coordinates(geometryFactory.createPoint(distance1 <= distance2 ? coordinates[0] : coordinates[1]))
                .isCore(true)
                .build()
        );
    }

    private String getNodeKey(Coordinate coordinate) {
        return coordinate.getX() + NODE_KEY_DELIMITER + coordinate.getY();
    }
}
