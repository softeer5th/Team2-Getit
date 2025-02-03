package com.softeer5.uniro_backend.route.service;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.SameStartAndEndPointException;
import com.softeer5.uniro_backend.common.exception.custom.UnreachableDestinationException;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.route.dto.CreateRouteServiceReqDTO;
import com.softeer5.uniro_backend.route.entity.DirectionType;
import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.dto.RouteDetailDTO;
import com.softeer5.uniro_backend.route.dto.RouteInfoDTO;
import com.softeer5.uniro_backend.route.dto.FastestRouteResDTO;
import com.softeer5.uniro_backend.route.repository.RouteRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Envelope;
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
            throw new SameStartAndEndPointException("Start and end nodes cannot be the same", ErrorCode.SAME_START_AND_END_POINT);
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

        List<RouteInfoDTO> routeInfoDTOS = new ArrayList<>();
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

            routeInfoDTOS.add(RouteInfoDTO.of(route, firstNode, secondNode));
        }

        List<RouteDetailDTO> details = getRouteDetail(startNode, endNode, shortestRoutes);

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
    private List<RouteDetailDTO> getRouteDetail(Node startNode, Node endNode, List<Route> shortestRoutes){
        List<RouteDetailDTO> details = new ArrayList<>();
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
                details.add(RouteDetailDTO.of(accumulatedDistance - calculateDistance(nowRoute)/2, checkPointType, checkPointNodeCoordinates));
                accumulatedDistance = calculateDistance(nowRoute)/2;
                checkPointNodeCoordinates = getCenter(now, nxt);
                checkPointType = DirectionType.CAUTION;
            }

            if(nxt.equals(endNode)){
                details.add(RouteDetailDTO.of(accumulatedDistance, checkPointType, checkPointNodeCoordinates));
                details.add(RouteDetailDTO.of(0, DirectionType.FINISH, nxt.getXY()));
                break;
            }
            if(nxt.isCore()){
                DirectionType directionType = calculateDirection(nxt, nowRoute, shortestRoutes.get(i+1));
                if(directionType == DirectionType.STRAIGHT){
                    now = nxt;
                    continue;
                }
                details.add(RouteDetailDTO.of(accumulatedDistance, checkPointType, checkPointNodeCoordinates));
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

    // TODO: 모든 점이 아니라 request 값의 MBR 영역만 불러오면 좋을 것 같다.  <- 추가 검증 필요
    // TODO: 캐시 사용 검토
    public List<Node> checkRouteCross(Long univId, List<CreateRouteServiceReqDTO> requests) {
        LinkedList<Node> createdNodes = new LinkedList<>();

        Map<String, Node> nodeMap = new HashMap<>();
        STRtree strTree = new STRtree();
        GeometryFactory geometryFactory = new GeometryFactory();

        List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

        for (Route route : routes) {
            Node node1 = route.getNode1();
            Node node2 = route.getNode2();

            LineString line = geometryFactory.createLineString(
                new Coordinate[] {node1.getCoordinates().getCoordinate(), node2.getCoordinates().getCoordinate()});
            Envelope envelope = line.getEnvelopeInternal();  // MBR 생성
            strTree.insert(envelope, line);

            nodeMap.putIfAbsent(node1.getCoordinates().getX() + " " + node1.getCoordinates().getY(), node1);
            nodeMap.putIfAbsent(node2.getCoordinates().getX() + " " + node2.getCoordinates().getY(), node2);
        }

        // 1. 첫번째 노드:
        // 서브 -> 코어 : 처리 필요
        // 코어 -> 코어 : 처리 필요 X
        // 코어 -> 서브 : 불가한 케이스

        CreateRouteServiceReqDTO init = requests.get(0);
        Node startNode = nodeMap.get(init.getX() + " " + init.getY());

        if (startNode == null) {
            // TODO: 예외처리 변경
            // 해당 노드는 DB에서 조회 필요, 없으면 예외 발생
            throw new IllegalArgumentException();
        }

        if(!startNode.isCore()){
            startNode.setCore(true);
        }
        createdNodes.add(startNode);

        for (int i = 1; i < requests.size(); i++) {
            CreateRouteServiceReqDTO cur = requests.get(i);

            // 정확히 그 점과 일치하는 노드가 있는지 확인
            Node curNode = nodeMap.get(cur.getX() + " " + cur.getY());
            if(curNode != null){
                curNode.setCore(true);
                createdNodes.add(curNode);
                continue;
            }

            Coordinate coordinate = new Coordinate(cur.getX(), cur.getY());

            curNode = Node.builder()
                .coordinates(geometryFactory.createPoint(coordinate))
                .isCore(false)
                .univId(univId)
                .build();

            createdNodes.add(curNode);
        }

        // 2. 두번째 노드 ~ N-1번째 노드
        // 현재 노드와 다음 노드가 기존 route와 겹치는지 확인
        ListIterator<Node> iterator = createdNodes.listIterator();
        // 첫 번째 요소는 무시하고 시작
        if (iterator.hasNext()) {
            iterator.next();
        }

        while(iterator.hasNext()){
            Node cur = iterator.next();
            Node prev = iterator.previous();

            Coordinate start = new Coordinate(prev.getCoordinates().getX(), prev.getCoordinates().getY());
            Coordinate end = new Coordinate(cur.getCoordinates().getX(), cur.getCoordinates().getY());

            LineString intersectLine = findIntersectLineString(start, end, strTree);

            if (intersectLine != null) {
                Coordinate[] coordinates = intersectLine.getCoordinates();
                // 가까운 점 탐색
                double distance1 = start.distance(coordinates[0]) + end.distance(coordinates[0]);
                double distance2 = start.distance(coordinates[1]) + end.distance(coordinates[1]);

                Node midNode;

                if (distance1 <= distance2) {
                    midNode = nodeMap.get(coordinates[0].getX() + " " + coordinates[0].getY());
                } else {
                    midNode = nodeMap.get(coordinates[1].getX() + " " + coordinates[1].getY());
                }

                midNode.setCore(true);
                iterator.add(midNode);
            }
        }

        List<Node> checkedSelfRouteCrossNodes = checkSelfRouteCross(createdNodes, geometryFactory);

        return checkedSelfRouteCrossNodes;
    }

    // 3. 자가 크로스 or 중복점 (첫점과 끝점 동일)
    // 해당 케이스 생길 경우 -> 해당 노드 코어 노드로 변경
    private List<Node> checkSelfRouteCross(List<Node> nodes, GeometryFactory geometryFactory) {

        if(nodes.get(0).getCoordinates().equals(nodes.get(nodes.size()-1).getCoordinates())){
            throw new IllegalArgumentException("출발점과 도착점은 같을 수 없습니다.");
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

            nodeMap.putIfAbsent(curNode.getCoordinates().getX() + " " + curNode.getCoordinates().getY(), curNode);
            nodeMap.putIfAbsent(nextNode.getCoordinates().getX() + " " + nextNode.getCoordinates().getY(), nextNode);
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
                    midNode = nodeMap.get(coordinates[0].getX() + " " + coordinates[0].getY());
                } else {
                    midNode = nodeMap.get(coordinates[1].getX() + " " + coordinates[1].getY());
                }

                midNode.setCore(true);

                // TODO: Node insert할 때는 좌표값으로 Node 중복 여부 판단 필요
                nodes.add(midNode);
            }
        }

        return nodes;
    }

    private LineString findIntersectLineString(Coordinate start, Coordinate end, STRtree strTree) {
        GeometryFactory geometryFactory = new GeometryFactory();
        LineString newLine = geometryFactory.createLineString(new Coordinate[] {start, end});
        Envelope searchEnvelope = newLine.getEnvelopeInternal();

        // 1️⃣ 후보 선분들 검색 (MBR이 겹치는 선분만 가져옴)
        List<?> candidates = strTree.query(searchEnvelope);

        // 2️⃣ 실제로 선분이 겹치는지 확인
        for (Object obj : candidates) {
            LineString existingLine = (LineString)obj;
            if (existingLine.intersects(newLine)) {
                return existingLine;  // 겹치는 선분이 하나라도 있으면 해당 LineString 반환
            }
        }

        return null;  // 겹치는 선분이 없으면 null 반환
    }


}
