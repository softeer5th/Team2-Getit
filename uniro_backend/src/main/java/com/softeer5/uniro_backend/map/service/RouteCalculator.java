package com.softeer5.uniro_backend.map.service;

import static com.softeer5.uniro_backend.common.constant.UniroConst.*;
import static com.softeer5.uniro_backend.common.error.ErrorCode.*;
import static com.softeer5.uniro_backend.map.entity.RoadExclusionPolicy.calculateCost;
import static com.softeer5.uniro_backend.map.entity.RoadExclusionPolicy.isAvailableRoute;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.NodeException;
import com.softeer5.uniro_backend.common.exception.custom.RouteCalculationException;
import com.softeer5.uniro_backend.common.utils.GeoUtils;
import com.softeer5.uniro_backend.map.dto.FastestRouteDTO;
import com.softeer5.uniro_backend.map.dto.FastestRouteResultDTO;
import com.softeer5.uniro_backend.map.dto.response.*;
import com.softeer5.uniro_backend.map.entity.*;
import com.softeer5.uniro_backend.map.dto.request.CreateRouteReqDTO;
import com.softeer5.uniro_backend.map.enums.CautionFactor;
import com.softeer5.uniro_backend.map.enums.DangerFactor;
import com.softeer5.uniro_backend.map.enums.DirectionType;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.enums.HeightStatus;
import lombok.AllArgsConstructor;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Envelope;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.index.strtree.STRtree;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class RouteCalculator {
    private final GeometryFactory geometryFactory = GeoUtils.getInstance();
    private final List<RoadExclusionPolicy> policies = List.of(
            RoadExclusionPolicy.PEDES,
            RoadExclusionPolicy.WHEEL_FAST,
            RoadExclusionPolicy.WHEEL_SAFE
    );

    @AllArgsConstructor
    private class CostToNextNode implements Comparable<CostToNextNode> {
        private double cost;
        private Node nextNode;
        private int cautionCount;

        @Override
        public int compareTo(CostToNextNode o) {
            return Double.compare(this.cost, o.cost);
        }
    }

    public AllRoutesInfo assembleRoutes(List<Route> routes) {
        Map<Long, List<Route>> adjMap = new HashMap<>();
        Map<Long, Node> nodeMap = new HashMap<>();
        List<BuildingRouteResDTO> buildingRoutes = new ArrayList<>();
        List<Node> buildingNodes = new ArrayList<>();

        for (Route route : routes) {

            if (isBuildingRoute(route)) {
                List<RouteCoordinatesInfoResDTO> routeCoordinates = new ArrayList<>();
                routeCoordinates.add(RouteCoordinatesInfoResDTO.of(route.getId(), route.getNode1().getId(), route.getNode2().getId()));
                buildingRoutes.add(BuildingRouteResDTO.of(route.getNode1().getId(), route.getNode2().getId(), routeCoordinates));
                buildingNodes.add(route.getNode1());
                buildingNodes.add(route.getNode2());
                continue;
            }

            nodeMap.put(route.getNode1().getId(), route.getNode1());
            nodeMap.put(route.getNode2().getId(), route.getNode2());

            adjMap.computeIfAbsent(route.getNode1().getId(), k -> new ArrayList<>()).add(route);
            adjMap.computeIfAbsent(route.getNode2().getId(), k -> new ArrayList<>()).add(route);

        }

        List<NodeInfoResDTO> nodeInfos = new ArrayList<>();

        for(Node node : nodeMap.values()) {
            nodeInfos.add(NodeInfoResDTO.of(node.getId(), node.getX(), node.getY()));
        }

        List<Node>startNode = determineStartNodes(adjMap, nodeMap);

        AllRoutesInfo result = AllRoutesInfo.of(nodeInfos, getCoreRoutes(adjMap, startNode), buildingRoutes);

        for(Node node : buildingNodes) {
            nodeInfos.add(NodeInfoResDTO.of(node.getId(), node.getX(), node.getY()));
        }

        return result;
    }

    private List<Node> determineStartNodes(Map<Long, List<Route>> adjMap,
                                           Map<Long, Node> nodeMap) {
        return nodeMap.values().stream()
                .filter(node -> node.isCore()
                        || (adjMap.containsKey(node.getId()) && adjMap.get(node.getId()).size() == 1))
                .toList();
    }


    public List<FastestRouteResDTO> calculateFastestRoute(Long startNodeId, Long endNodeId, List<Route> routes){
        List<FastestRouteResDTO> result = new ArrayList<>();

        for (RoadExclusionPolicy policy : policies) {
            //인접 리스트
            Map<Long, List<Route>> adjMap = new HashMap<>();
            Map<Long, Node> nodeMap = new HashMap<>();

            for (Route route : routes) {
                if (!isAvailableRoute(policy, route)) continue;
                addRouteToGraph(route, adjMap, nodeMap);
            }

            Node startNode = nodeMap.get(startNodeId);
            Node endNode = nodeMap.get(endNodeId);

            if(startNode==null || endNode==null){
                continue;
            }

            //길찾기 알고리즘 수행
            FastestRouteDTO fastestRouteDTO = findFastestRoute(startNode, endNode, adjMap, policy);
            if(fastestRouteDTO==null) continue;
            Map<Long, Route> prevRoute = fastestRouteDTO.getPrevRoute();


            //길찾기 결과가 null인 경우 continue
            if(prevRoute == null) continue;

            //길찾기 경로 결과 정리
            List<Route> shortestRoutes = reorderRoute(startNode, endNode, prevRoute);
            Route startRoute = shortestRoutes.get(0);
            Route endRoute = shortestRoutes.get(shortestRoutes.size() - 1);

            if (isBuildingRoute(startRoute)) {
                if (startRoute.getId().equals(endRoute.getId())) {
                    //출발점과 도착점이 같은 경우
                    continue;
                }
                startNode = startNode.getId().equals(startRoute.getNode1().getId()) ? startRoute.getNode2() : startRoute.getNode1();
                shortestRoutes.remove(0);
            }
            //만약 종료 route가 건물과 이어진 노드라면 해당 route는 결과에서 제외
            if (isBuildingRoute(endRoute)) {
                endNode = endNode.getId().equals(endRoute.getNode1().getId()) ? endRoute.getNode2() : endRoute.getNode1();
                shortestRoutes.remove(shortestRoutes.size() - 1);
            }

            FastestRouteResultDTO fastestRouteResult = generateResult(shortestRoutes, startNode);

            //처음과 마지막을 제외한 구간에서 빌딩노드를 거쳐왔다면, 이는 유효한 길이 없는 것이므로 예외처리
            if (fastestRouteResult.getTotalDistance() > BUILDING_ROUTE_DISTANCE - 1) continue;

            List<RouteDetailResDTO> details = getRouteDetail(startNode, endNode, shortestRoutes);

            result.add(FastestRouteResDTO.of(policy,
                    fastestRouteResult.isHasCaution(),
                    fastestRouteResult.isHasDanger(),
                    fastestRouteResult.getTotalDistance(),
                    calculateCost(policy, PEDESTRIAN_SECONDS_PER_MITER,
                            fastestRouteDTO.getTotalWeightDistance() % BUILDING_ROUTE_DISTANCE
                                + fastestRouteResult.getHeightIncreaseWeight() - fastestRouteResult.getHeightDecreaseWeight()),
                    calculateCost(policy, MANUAL_WHEELCHAIR_SECONDS_PER_MITER,
                            fastestRouteDTO.getTotalWeightDistance() % BUILDING_ROUTE_DISTANCE
                            + fastestRouteResult.getHeightIncreaseWeight() + fastestRouteResult.getHeightDecreaseWeight()),
                    calculateCost(policy, ELECTRIC_WHEELCHAIR_SECONDS_PER_MITER,
                            fastestRouteDTO.getTotalWeightDistance() % BUILDING_ROUTE_DISTANCE),
                    fastestRouteResult.getRouteInfoDTOS(),
                    details));
        }

        if(result.isEmpty()) {
            throw new RouteCalculationException("Unable to find a valid route", ErrorCode.FASTEST_ROUTE_NOT_FOUND);
        }

        return result;
    }

    private void addRouteToGraph(Route route, Map<Long, List<Route>> adjMap, Map<Long, Node> nodeMap) {
        adjMap.computeIfAbsent(route.getNode1().getId(), k -> new ArrayList<>()).add(route);
        adjMap.computeIfAbsent(route.getNode2().getId(), k -> new ArrayList<>()).add(route);
        nodeMap.putIfAbsent(route.getNode1().getId(), route.getNode1());
        nodeMap.putIfAbsent(route.getNode2().getId(), route.getNode2());
    }

    private FastestRouteDTO findFastestRoute(Node startNode, Node endNode, Map<Long, List<Route>> adjMap, RoadExclusionPolicy policy){
        //key : nodeId, value : 최단거리 중 해당 노드를 향한 route
        Map<Long, Route> prevRoute = new HashMap<>();
        // startNode로부터 각 노드까지 걸리는 cost를 저장하는 자료구조
        Map<Long, Double> costMap = new HashMap<>();
        PriorityQueue<CostToNextNode> pq = new PriorityQueue<>();
        pq.add(new CostToNextNode(0.0, startNode,0));
        costMap.put(startNode.getId(), 0.0);

        // 길찾기 알고리즘
        while(!pq.isEmpty()){
            CostToNextNode costToNextNode = pq.poll();
            double currentDistance = costToNextNode.cost;
            Node currentNode = costToNextNode.nextNode;
            int currentCautionCount = costToNextNode.cautionCount;
            if (currentNode.getId().equals(endNode.getId())) break;
            if(costMap.containsKey(currentNode.getId())
                    && currentDistance > costMap.get(currentNode.getId())) continue;

            for(Route route : adjMap.getOrDefault(currentNode.getId(), Collections.emptyList())){
                Node nextNode = route.getNode1().getId().equals(currentNode.getId())?route.getNode2():route.getNode1();
                double newDistance = currentDistance + route.getDistance();

                if(policy==RoadExclusionPolicy.WHEEL_FAST && !route.getCautionFactors().isEmpty()){
                    currentCautionCount++;
                    newDistance += getRiskHeuristicWeight(currentCautionCount);
                }

                if(!costMap.containsKey(nextNode.getId()) || costMap.get(nextNode.getId()) > newDistance){
                    costMap.put(nextNode.getId(), newDistance);
                    pq.add(new CostToNextNode(newDistance, nextNode, currentCautionCount));
                    prevRoute.put(nextNode.getId(), route);
                }
            }
        }
        //길 없는 경우
        if(!costMap.containsKey(endNode.getId())){
            return null;
        }

        return FastestRouteDTO.of(prevRoute, costMap.get(endNode.getId()));
    }

    // A* 알고리즘의 휴리스틱 중 지나온 위험요소의 개수에 따른 가중치 부여
    private double getRiskHeuristicWeight(int currentCautionCount) {
        return Math.pow(currentCautionCount,2);
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

    private FastestRouteResultDTO generateResult(List<Route> shortestRoutes, Node startNode) {
        boolean hasCaution = false;
        boolean hasDanger = false;
        double totalDistance = 0.0;
        double heightIncreaseWeight = 0.0;
        double heightDecreaseWeight = 0.0;

        // 결과를 DTO로 정리
        List<RouteInfoResDTO> routeInfoDTOS = new ArrayList<>();
        Node currentNode = startNode;
        // 외부 변수를 수정해야하기 때문에 for-loop문 사용
        for (Route route : shortestRoutes) {
            totalDistance += route.getDistance();
            if (!route.getCautionFactors().isEmpty()) {
                hasCaution = true;
            }
            if(!route.getDangerFactors().isEmpty()){
                hasDanger = true;
            }

            Node firstNode = route.getNode1();
            Node secondNode = route.getNode2();
            if (currentNode.getId().equals(secondNode.getId())) {
                Node temp = firstNode;
                firstNode = secondNode;
                secondNode = temp;
            }
            currentNode = secondNode;

            double heightDiff = firstNode.getHeight() - secondNode.getHeight();
            if(heightDiff > 0){
                heightIncreaseWeight += Math.min(LIMIT_RANGE ,Math.exp(heightDiff) - 1);
            }
            else{
                heightDecreaseWeight += Math.min(LIMIT_RANGE, Math.exp(-heightDiff) - 1);
            }

            routeInfoDTOS.add(RouteInfoResDTO.of(route, firstNode, secondNode));
        }
        return FastestRouteResultDTO.of(hasCaution,hasDanger,totalDistance,heightIncreaseWeight,heightDecreaseWeight,routeInfoDTOS);
    }

    private boolean isBuildingRoute(Route route){
        return route.getDistance() > BUILDING_ROUTE_DISTANCE - 1;
    }

    // 두 route 간의 각도를 통한 계산으로 방향성을 정하는 메서드
    private DirectionType calculateDirection(Node secondNode, List<Route> shortestRoutes, int idx) {
        Node firstNode = shortestRoutes.get(idx).getNode1().equals(secondNode) ?
                shortestRoutes.get(idx).getNode2() : shortestRoutes.get(idx).getNode1();
        Node thirdNode = shortestRoutes.get(idx+1).getNode2().equals(secondNode) ?
                shortestRoutes.get(idx+1).getNode1() : shortestRoutes.get(idx+1).getNode2();

        if(idx-1 >= 0){
            firstNode = shortestRoutes.get(idx-1).getNode1().equals(secondNode) ?
                    shortestRoutes.get(idx-1).getNode2() : shortestRoutes.get(idx-1).getNode1();
        }

        if(idx+2 <= shortestRoutes.size()-1){
            thirdNode = shortestRoutes.get(idx+2).getNode2().equals(secondNode) ?
                    shortestRoutes.get(idx+2).getNode1() : shortestRoutes.get(idx+2).getNode2();
        }

        Point p1 = firstNode.getCoordinates();
        Point p2 = secondNode.getCoordinates();
        Point p3 = thirdNode.getCoordinates();

        return calculateAngle(p1, p2, p3);
    }

    private DirectionType calculateAngle(Point p1, Point p2, Point p3) {
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
            return (crossProduct > 0) ? DirectionType.LEFT : DirectionType.RIGHT;
        } else if (angle >= 150 && angle < 180) {
            return (crossProduct > 0) ? DirectionType.SHARP_LEFT : DirectionType.SHARP_RIGHT;
        } else {
            return DirectionType.STRAIGHT;
        }
    }

    private double calculateRouteDistance(Route route){
        return calculateDistance(route.getNode1().getCoordinates().getX(),
                route.getNode1().getCoordinates().getY(),
                route.getNode2().getCoordinates().getX(),
                route.getNode2().getCoordinates().getY());
    }

    // 하버사인 공식으로 길의 길이를 리턴하는 메서드
    private double calculateDistance(double lng1, double lat1, double lng2, double lat2) {
        double radLat1 = Math.toRadians(lat1);
        double radLat2 = Math.toRadians(lat2);
        double radLng1 = Math.toRadians(lng1);
        double radLng2 = Math.toRadians(lng2);

        double deltaLat = radLat2 - radLat1;
        double deltaLng = radLng2 - radLng1;

        double a = Math.pow(Math.sin(deltaLat / 2), 2)
                + Math.cos(radLat1) * Math.cos(radLat2)
                * Math.pow(Math.sin(deltaLng / 2), 2);
        double c = 2 * Math.asin(Math.sqrt(a));

        return EARTH_RADIUS * c;
    }

    // 길 상세정보를 추출하는 메서드
    private List<RouteDetailResDTO> getRouteDetail(Node startNode, Node endNode, List<Route> shortestRoutes){
        List<RouteDetailResDTO> details = new ArrayList<>();
        double accumulatedDistance = 0.0;
        Node now = startNode;
        Map<String,Double> checkPointNodeCoordinates = startNode.getXY();
        DirectionType checkPointType = DirectionType.STRAIGHT;
        List<CautionFactor> checkPointCautionFactors = new ArrayList<>();
        List<DangerFactor> checkPointDangerFactors = new ArrayList<>();

        // 길찾기 결과 상세정보 정리
        for(int i=0;i<shortestRoutes.size();i++){
            Route nowRoute = shortestRoutes.get(i);
            Node nxt = nowRoute.getNode1().equals(now) ? nowRoute.getNode2() : nowRoute.getNode1();
            accumulatedDistance += calculateRouteDistance(nowRoute);

            if(!nowRoute.getCautionFactors().isEmpty()){
                double halfOfRouteDistance = calculateRouteDistance(nowRoute)/2;
                details.add(RouteDetailResDTO.of(accumulatedDistance - halfOfRouteDistance,
                        checkPointType, checkPointNodeCoordinates, checkPointCautionFactors, checkPointDangerFactors));
                accumulatedDistance = halfOfRouteDistance;
                checkPointNodeCoordinates = getCenter(now, nxt);
                checkPointType = DirectionType.CAUTION;
                checkPointCautionFactors = nowRoute.getCautionFactorsByList();
                checkPointDangerFactors = Collections.emptyList();
            }

            if(!nowRoute.getDangerFactors().isEmpty()){
                double halfOfRouteDistance = calculateRouteDistance(nowRoute)/2;
                details.add(RouteDetailResDTO.of(accumulatedDistance - halfOfRouteDistance,
                        checkPointType, checkPointNodeCoordinates, checkPointCautionFactors, checkPointDangerFactors));
                accumulatedDistance = halfOfRouteDistance;
                checkPointNodeCoordinates = getCenter(now, nxt);
                checkPointType = DirectionType.DANGER;
                checkPointDangerFactors = nowRoute.getDangerFactorsByList();
                checkPointCautionFactors = Collections.emptyList();
            }

            if(nxt.equals(endNode)){
                details.add(RouteDetailResDTO.of(accumulatedDistance, checkPointType,
                        checkPointNodeCoordinates, checkPointCautionFactors, checkPointDangerFactors));
                details.add(RouteDetailResDTO.of(0, DirectionType.FINISH, nxt.getXY(), new ArrayList<>(), new ArrayList<>()));
                break;
            }
            if(nxt.isCore()){
                DirectionType directionType = calculateDirection(nxt, shortestRoutes, i);

                if(directionType == DirectionType.STRAIGHT){
                    now = nxt;
                    continue;
                }
                details.add(RouteDetailResDTO.of(accumulatedDistance, checkPointType,
                        checkPointNodeCoordinates, checkPointCautionFactors, checkPointDangerFactors));
                checkPointNodeCoordinates = nxt.getXY();
                checkPointType = directionType;
                accumulatedDistance = 0.0;
                checkPointCautionFactors = Collections.emptyList();
                checkPointDangerFactors = Collections.emptyList();
            }

            now = nxt;
        }

        return details;
    }

    private Map<String,Double> getCenter(Node n1, Node n2){
        return Map.of("lat", (n1.getCoordinates().getY() + n2.getCoordinates().getY())/2
                , "lng", (n1.getCoordinates().getX() + n2.getCoordinates().getX())/2);
    }

    // coreRoute를 만들어주는 메서드
    public List<CoreRouteResDTO> getCoreRoutes(Map<Long, List<Route>> adjMap, List<Node> startNode) {
        List<CoreRouteResDTO> result = new ArrayList<>();
        // core node간의 BFS 할 때 방문여부를 체크하는 set
        Set<Long> visitedCoreNodes = new HashSet<>();
        // 길 중복을 처리하기 위한 set
        Set<Long> routeSet = new HashSet<>();

        // BFS 전처리
        Queue<Node> nodeQueue = new LinkedList<>();
        startNode.forEach(n-> {
            nodeQueue.add(n);
            visitedCoreNodes.add(n.getId());
        });

        // BFS
        while(!nodeQueue.isEmpty()) {
            // 현재 노드 (코어노드)
            Node now = nodeQueue.poll();
            for(Route r : adjMap.get(now.getId())) {
                // 만약 now-nxt를 연결하는 길이 이미 등록되어있다면, 해당 coreRoute는 이미 등록된 것이므로 continue;
                if(routeSet.contains(r.getId())) continue;

                // 다음 노드 (서브노드일수도 있고 코어노드일 수도 있음)
                Node currentNode = now.getId().equals(r.getNode1().getId()) ? r.getNode2() : r.getNode1();

                // 코어루트를 이루는 node들을 List로 저장
                List<RouteCoordinatesInfoResDTO> coreRoute = new ArrayList<>();
                coreRoute.add(RouteCoordinatesInfoResDTO.of(r.getId(),now.getId(), currentNode.getId()));
                routeSet.add(r.getId());

                while (true) {
                    //코어노드를 만나면 queue에 넣을지 판단한 뒤 종료 (제자리로 돌아오는 경우도 포함)
                    if (currentNode.isCore() || currentNode.getId().equals(now.getId())) {
                        if (!visitedCoreNodes.contains(currentNode.getId())) {
                            visitedCoreNodes.add(currentNode.getId());
                            nodeQueue.add(currentNode);
                        }
                        break;
                    }
                    // 끝점인 경우 종료
                    if (adjMap.get(currentNode.getId()).size() == 1) break;

                    // 서브노드에 연결된 두 route 중 방문하지 않았던 route를 선택한 뒤, currentNode를 업데이트
                    for (Route R : adjMap.get(currentNode.getId())) {
                        if (routeSet.contains(R.getId())) continue;
                        Node nextNode = R.getNode1().getId().equals(currentNode.getId()) ? R.getNode2() : R.getNode1();
                        coreRoute.add(RouteCoordinatesInfoResDTO.of(R.getId(), currentNode.getId(), nextNode.getId()));
                        routeSet.add(R.getId());
                        currentNode = nextNode;
                    }
                }
                result.add(CoreRouteResDTO.of(now.getId(), currentNode.getId(), coreRoute));
            }

        }
        return result;
    }

    /**
     * @param univId : 경로를 생성할 대학교 id
     * @param nodes : 경로를 생성할 노드들
     *
     * @apiNote : 두 노드 간의 경로의 cost를 계산하여 Route 객체 생성
     *
     * @implNote : 첫번째 노드는 항상 코어노드여야 함
     * @implNote : 노드들은 순서대로 연결되어 있어야 함
     * @implNote : 중복된 노드들은 메모리 주소가 같기 때문에 하나의 객체로 인식됨
     * */
    public List<Route> createLinkedRouteAndSave(Long univId, List<Node> nodes) {

        List<Route> routesForSave = new ArrayList<>();
        for(int i=1;i<nodes.size();i++){
            Node now = nodes.get(i);
            Node prev = nodes.get(i-1);
            routesForSave.add(
                Route.builder()
                    .distance(calculateDistance(prev.getCoordinates().getX(),
                                                prev.getCoordinates().getY(),
                                                now.getCoordinates().getX(),
                                                now.getCoordinates().getY()))
                    .path(geometryFactory.createLineString(
                            new Coordinate[] {prev.getCoordinates().getCoordinate(), now.getCoordinates().getCoordinate()}))
                    .node1(prev)
                    .node2(now)
                    .cautionFactors(Collections.EMPTY_SET)
                    .dangerFactors(Collections.EMPTY_SET)
                    .univId(univId).build());
        }

        return routesForSave;
    }



    public List<Node> createValidRouteNodes(Long univId, Long startNodeId, Long endNodeId, List<CreateRouteReqDTO> requests, List<Route> routes) {
        LinkedList<Node> createdNodes = new LinkedList<>();

        Map<String, Node> nodeMap = new HashMap<>();
        STRtree strTree = new STRtree();

        int startNodeCount = 0;
        int endNodeCount = 0;

        for (Route route : routes) {
            if(isBuildingRoute(route)) continue;
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

        // 중복된 노드가 있는지 확인
        validateDuplicateNodes(requests);

        // 1. 첫번째 노드:
        // 서브 -> 코어 : 처리 필요
        // 코어 -> 코어 : 처리 필요 X
        // 코어 -> 서브 : 불가한 케이스
        CreateRouteReqDTO startCoordinate = requests.get(0);
        Node startNode = nodeMap.get(getNodeKey(new Coordinate(startCoordinate.getLng(), startCoordinate.getLat())));

        if (startNode == null) {
            throw new NodeException("Start Node Not Found", NODE_NOT_FOUND);
        }

        if(!startNode.isCore() && startNodeCount == CORE_NODE_CONDITION - 1){
            startNode.setCore(true);
        }
        createdNodes.add(startNode);

        double nodeHeight = startNode.getHeight();

        // 기존에 저장된 노드와 일치하거나 or 새로운 노드와 겹칠 경우 -> 동일한 것으로 판단
        for (int i = 1; i < requests.size(); i++) {
            CreateRouteReqDTO cur = requests.get(i);

            // 정확히 그 점과 일치하는 노드가 있는지 확인
            Node curNode = nodeMap.get(getNodeKey(new Coordinate(cur.getLng(), cur.getLat())));
            if(curNode != null){
                createdNodes.add(curNode);
                nodeHeight = (nodeHeight + curNode.getHeight()) / 2;
                if(i == requests.size() - 1 && endNodeCount < CORE_NODE_CONDITION - 1){  // 마지막 노드일 경우, 해당 노드가 끝점일 경우
                    continue;
                }

                curNode.setCore(true);
                continue;
            }

            Coordinate coordinate = new Coordinate(cur.getLng(), cur.getLat());
            curNode = Node.builder()
                .coordinates(geometryFactory.createPoint(coordinate))
                .height(nodeHeight)
                .isCore(false)
                .univId(univId)
                .status(HeightStatus.READY)
                .build();

            createdNodes.add(curNode);
            nodeMap.putIfAbsent(curNode.getNodeKey(), curNode);
        }

        // 2. 두번째 노드 ~ N-1번째 노드
        // 현재 노드와 다음 노드가 기존 route와 겹치는지 확인
        List<Node> crossCheckedNodes = insertMidNodesForIntersectingRoutes(createdNodes, strTree, nodeMap);

        // 3. 자가 크로스 or 중복점 (첫점과 끝점 동일) 확인
        List<Node> selfCrossCheckedNodes = insertMidNodesForSelfIntersectingRoutes(crossCheckedNodes);

        return selfCrossCheckedNodes;
    }

    private void validateDuplicateNodes(List<CreateRouteReqDTO> requests) {
        for (int i = 0; i < requests.size(); i++) {
            Coordinate curCoordinate = new Coordinate(requests.get(i).getLng(), requests.get(i).getLat());
            String curNodeKey = getNodeKey(curCoordinate);

            for (int j = i + 1; j < Math.min(i + 3, requests.size()); j++) {
                Coordinate nextCoordinate = new Coordinate(requests.get(j).getLng(), requests.get(j).getLat());
                String nextNodeKey = getNodeKey(nextCoordinate);

                if (curNodeKey.equals(nextNodeKey)) {
                    throw new RouteCalculationException("has duplicate nearest node", DUPLICATE_NEAREST_NODE);
                }
            }
        }
    }

    private List<Node> insertMidNodesForIntersectingRoutes(List<Node> nodes, STRtree strTree, Map<String, Node> nodeMap) {
        ListIterator<Node> iterator = nodes.listIterator();
        if (!iterator.hasNext()) return Collections.emptyList();
        Node prev = iterator.next();

        while (iterator.hasNext()) {
            Node cur = iterator.next();
            LineString intersectLine = findIntersectLineString(prev.getCoordinates().getCoordinate(), cur.getCoordinates()
                .getCoordinate(), strTree, false);
            if (intersectLine != null) {
                Node midNode = getClosestNode(intersectLine, prev, cur, nodeMap);
                midNode.setCore(true);
                iterator.previous(); // 이전으로 이동
                iterator.add(midNode); // 이전 위치에 삽입
                cur = midNode;
            }
            prev = cur;
        }

        return nodes;
    }


    private List<Node> insertMidNodesForSelfIntersectingRoutes(List<Node> nodes) {
        if(nodes.get(0).getCoordinates().equals(nodes.get(nodes.size()-1).getCoordinates())){
            throw new RouteCalculationException("Start and end nodes cannot be the same", SAME_START_AND_END_POINT);
        }

        ListIterator<Node> iterator = nodes.listIterator();
        if (!iterator.hasNext()) return Collections.emptyList();

        Node prev = iterator.next();
        Map<String, Node> nodeMap = new HashMap<>();

        while(iterator.hasNext()){
            STRtree strTree = new STRtree();

            int last = iterator.nextIndex();
            for (int i = 0; i < last; i++) {
                Node prevCurNode = nodes.get(i);
                Node prevNextNode = nodes.get(i + 1);
                LineString line = geometryFactory.createLineString(
                    new Coordinate[] {prevCurNode.getCoordinates().getCoordinate(), prevNextNode.getCoordinates().getCoordinate()});
                Envelope envelope = line.getEnvelopeInternal();  // MBR 생성
                strTree.insert(envelope, line);

                nodeMap.putIfAbsent(prevCurNode.getNodeKey(), prevCurNode);
                nodeMap.putIfAbsent(prevNextNode.getNodeKey(), prevNextNode);
            }

            Node cur = iterator.next();
            LineString intersectLine = findIntersectLineString(prev.getCoordinates().getCoordinate(),
				cur.getCoordinates().getCoordinate(), strTree, true);
            if(intersectLine != null){
                Node midNode = getClosestNode(intersectLine, prev, cur, nodeMap);
                midNode.setCore(true);
                iterator.previous();
                iterator.add(midNode);
                cur = midNode;
            }
            prev = cur;
        }

        return nodes;
    }

    /**
     * @param start 시작 좌표
     * @param end 끝 좌표
     * @implSpec 선분과 겹치는 선분이 있는지 확인
     * @return 겹치는 선분이 있으면 해당 선분 반환, 없으면 null 반환
     *
     * @implNote
     * */
    private LineString findIntersectLineString(Coordinate start, Coordinate end, STRtree strTree, boolean isSelfCheck) {
        LineString newLine = geometryFactory.createLineString(new Coordinate[] {start, end});
        Envelope searchEnvelope = newLine.getEnvelopeInternal();

        // 1️⃣ 후보 선분들 검색 (MBR이 겹치는 선분만 가져옴)
        List<?> candidates = strTree.query(searchEnvelope);

        LineString closestLine = null;
        double minDistance = Double.MAX_VALUE;

        // 2️⃣ 실제로 선분이 겹치는지 확인
        for (Object obj : candidates) {
            LineString existingLine = (LineString)obj;

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
                    if (isSelfCheck && existingLine.equalsTopo(newLine)) {
                        continue;
                    }

                    throw new RouteCalculationException("intersection is only allowed by point", INTERSECTION_ONLY_ALLOWED_POINT);
                }

            }
        }

        return closestLine;  // 겹치는 선분이 없으면 null 반환
    }

    private Node getClosestNode(LineString intersectLine, Node start, Node end, Map<String, Node> nodeMap) {
        Coordinate[] coordinates = intersectLine.getCoordinates();

        double distance1 = start.getCoordinates().getCoordinate().distance(coordinates[0]) +
            end.getCoordinates().getCoordinate().distance(coordinates[0]);
        double distance2 = start.getCoordinates().getCoordinate().distance(coordinates[1]) +
            end.getCoordinates().getCoordinate().distance(coordinates[1]);

        return nodeMap.getOrDefault(
            getNodeKey(distance1 <= distance2 ? coordinates[0] : coordinates[1]),
            Node.builder().coordinates(geometryFactory.createPoint(distance1 <= distance2 ? coordinates[0] : coordinates[1]))
                .isCore(true)
                .status(HeightStatus.READY)
                .build()
        );
    }

    private String getNodeKey(Coordinate coordinate) {
        return coordinate.getX() + NODE_KEY_DELIMITER + coordinate.getY();
    }

    public GetRiskRoutesResDTO mapRisks(List<Route> riskRoutes) {
        List<GetDangerResDTO> dangerRoutes = mapRoutesToDangerDTO(riskRoutes);
        List<GetCautionResDTO> cautionRoutes = mapRoutesToCautionDTO(riskRoutes);

        return GetRiskRoutesResDTO.of(dangerRoutes, cautionRoutes);
    }

    private List<GetDangerResDTO> mapRoutesToDangerDTO(List<Route> routes) {
        return routes.stream()
                .filter(route -> !route.getDangerFactors().isEmpty() && route.getCautionFactors().isEmpty()) // 위험 요소가 있는 경로만 필터링
                .map(route -> GetDangerResDTO.of(
                        getPoint(route.getPath().getCoordinates()[0]),
                        getPoint(route.getPath().getCoordinates()[1]),
                        route.getId(),
                        route.getDangerFactorsByList()
                )).toList();
    }

    private List<GetCautionResDTO> mapRoutesToCautionDTO(List<Route> routes) {
        return routes.stream()
                .filter(route -> route.getDangerFactors().isEmpty() && !route.getCautionFactors().isEmpty())
                .map(route -> GetCautionResDTO.of(
                        getPoint(route.getPath().getCoordinates()[0]),
                        getPoint(route.getPath().getCoordinates()[1]),
                        route.getId(),
                        route.getCautionFactorsByList()
                )).toList();
    }

    private Map<String, Double> getPoint(Coordinate c) {
        Map<String, Double> point = new HashMap<>();
        point.put("lat", c.getY());
        point.put("lng", c.getX());
        return point;
    }
}
