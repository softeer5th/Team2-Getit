package com.softeer5.uniro_backend.route.service;

import com.softeer5.uniro_backend.node.Node;
import com.softeer5.uniro_backend.node.repository.NodeRepository;
import com.softeer5.uniro_backend.route.DirectionType;
import com.softeer5.uniro_backend.route.Route;
import com.softeer5.uniro_backend.route.dto.RouteDetailDTO;
import com.softeer5.uniro_backend.route.dto.RouteInfoDTO;
import com.softeer5.uniro_backend.route.dto.ShortestRouteDTO;
import com.softeer5.uniro_backend.route.repository.RouteRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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

    public ShortestRouteDTO calculateFastestRoute(Long startNodeId, Long endNodeId){

        if(startNodeId.equals(endNodeId)){
            throw new RuntimeException(); // 추후 처리예정
        }

        //인접 리스트
        Map<Long, List<Route>> adjMap = new HashMap<>();
        routeRepository.findAll().forEach(route -> {
            adjMap.computeIfAbsent(route.getNode1().getId(), k -> new ArrayList<>()).add(route);
            adjMap.computeIfAbsent(route.getNode2().getId(), k -> new ArrayList<>()).add(route);
        });


        PriorityQueue<CostToNextNode> pq = new PriorityQueue<>();
        // startNode로부터 각 노드까지 걸리는 cost를 저장하는 자료구조
        Map<Long, Double> costMap = new HashMap<>();
        //key : nodeId, value : 최단거리 중 해당 노드를 향한 route
        Map<Long, Route> prevRoute = new HashMap<>();

        Node startNode = nodeRepository.findById(startNodeId).orElseThrow();
        Node endNode = nodeRepository.findById(endNodeId).orElseThrow();
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
            throw new RuntimeException(); // 추후 처리예정
        }

        //길찾기 경로 결과 정리

        List<Route> shortestRoutes = new ArrayList<>();
        Node node = endNode;
        boolean hasCaution = false;

        //endNode부터 역순회하여 배열에 저장
        while(!node.getId().equals(startNode.getId())){
            Route previousRoute = prevRoute.get(node.getId());
            shortestRoutes.add(previousRoute);
            if(!previousRoute.getCautionFactors().isEmpty()){
                hasCaution = true;
            }

            node = previousRoute.getNode1().getId().equals(node.getId()) ? previousRoute.getNode2() : previousRoute.getNode1();
        }

        //이후 reverse를 통해 시작점 -> 도착점 방향으로 재정렬
        Collections.reverse(shortestRoutes);

        List<RouteInfoDTO> routeInfoDTOS = shortestRoutes.stream()
                .map(route -> RouteInfoDTO.builder()
                        .routeId(route.getId())
                        .node1(route.getNode1().getXY())
                        .node2(route.getNode2().getXY())
                        .cautionFactors(route.getCautionFactors())
                        .build())
                .collect(Collectors.toList());


        List<RouteDetailDTO> details = new ArrayList<>();
        double totalDistance = 0.0;
        double accumulatedDistance = 0.0;
        double totalCost = 0.0;
        Node now = startNode;

        // 길찾기 결과 상세정보 정리
        for(int i=0;i<shortestRoutes.size();i++){
            Route nowRoute = shortestRoutes.get(i);
            Node nxt = nowRoute.getNode1().equals(now) ? nowRoute.getNode2() : nowRoute.getNode1();
            totalDistance += calculateDistance(nowRoute);
            accumulatedDistance += calculateDistance(nowRoute);
            totalCost += nowRoute.getCost();
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


        return ShortestRouteDTO.builder()
                .totalDistance(totalDistance)
                .totalCost(totalCost)
                .hasCaution(hasCaution)
                .routes(routeInfoDTOS)
                .routeDetails(details)
                .build();
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

    private double calculateDistance(Route route) {
        Point p1 = route.getNode1().getCoordinates();
        Point p2 = route.getNode2().getCoordinates();

        double deltaX = p2.getX() - p1.getX();
        double deltaY = p2.getY() - p1.getY();

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }


}
