package com.softeer5.uniro_backend.route.service;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.SameStartAndEndPointException;
import com.softeer5.uniro_backend.common.exception.custom.UnreachableDestinationException;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.node.repository.NodeRepository;
import com.softeer5.uniro_backend.route.entity.DirectionType;
import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.dto.RouteDetailDTO;
import com.softeer5.uniro_backend.route.dto.RouteInfoDTO;
import com.softeer5.uniro_backend.route.dto.FastestRouteResDTO;
import com.softeer5.uniro_backend.route.repository.RouteRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteCalculationService {
    private final RouteRepository routeRepository;
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

        // 외부 변수를 수정해야하기 때문에 for-loop문 사용
        for (Route route : shortestRoutes) {
            totalCost += route.getCost();
            totalDistance += calculateDistance(route);

            if (!route.getCautionFactors().isEmpty()) {
                hasCaution = true;
            }

            routeInfoDTOS.add(RouteInfoDTO.builder()
                    .routeId(route.getId())
                    .node1(route.getNode1().getXY())
                    .node2(route.getNode2().getXY())
                    .cautionFactors(route.getCautionFactors())
                    .build());
        }

        List<RouteDetailDTO> details = getRouteDetail(startNode, endNode, shortestRoutes);

        return FastestRouteResDTO.builder()
                .totalDistance(totalDistance)
                .totalCost(totalCost)
                .hasCaution(hasCaution)
                .routes(routeInfoDTOS)
                .routeDetails(details)
                .build();
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
            return (crossProduct < 0) ? DirectionType.RIGHT : DirectionType.LEFT;
        } else if (angle >= 150 && angle < 180) {
            return (crossProduct < 0) ? DirectionType.SHARP_RIGHT : DirectionType.SHARP_LEFT;
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

        // 길찾기 결과 상세정보 정리
        for(int i=0;i<shortestRoutes.size();i++){
            Route nowRoute = shortestRoutes.get(i);
            Node nxt = nowRoute.getNode1().equals(now) ? nowRoute.getNode2() : nowRoute.getNode1();
            accumulatedDistance += calculateDistance(nowRoute);

            if(!nowRoute.getCautionFactors().isEmpty()){
                details.add(new RouteDetailDTO(accumulatedDistance, DirectionType.CAUTION));
                accumulatedDistance = 0.0;
            }

            if(nxt.equals(endNode)){
                details.add(new RouteDetailDTO(accumulatedDistance, DirectionType.FINISH));
                break;
            }
            if(nxt.isCore()){
                DirectionType directionType = calculateDirection(nxt, nowRoute, shortestRoutes.get(i+1));
                if(directionType == DirectionType.STRAIGHT){
                    now = nxt;
                    continue;
                }
                details.add(new RouteDetailDTO(accumulatedDistance, directionType));
                accumulatedDistance = 0.0;
            }

            now = nxt;
        }

        return details;
    }


}
