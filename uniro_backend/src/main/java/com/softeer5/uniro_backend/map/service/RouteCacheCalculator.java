package com.softeer5.uniro_backend.map.service;

import static com.softeer5.uniro_backend.common.constant.UniroConst.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.stereotype.Component;

import com.softeer5.uniro_backend.common.utils.GeoUtils;
import com.softeer5.uniro_backend.map.dto.response.AllRoutesInfo;
import com.softeer5.uniro_backend.map.dto.response.BuildingRouteResDTO;
import com.softeer5.uniro_backend.map.dto.response.CoreRouteResDTO;
import com.softeer5.uniro_backend.map.dto.response.NodeInfoResDTO;
import com.softeer5.uniro_backend.map.dto.response.RouteCoordinatesInfoResDTO;
import com.softeer5.uniro_backend.map.service.vo.LightNode;
import com.softeer5.uniro_backend.map.service.vo.LightRoute;

@Component
public class RouteCacheCalculator {

	private final GeometryFactory geometryFactory = GeoUtils.getInstance();

	public AllRoutesInfo assembleRoutes(List<LightRoute> routes) {
		Map<Long, List<LightRoute>> adjMap = new HashMap<>();
		Map<Long, LightNode> nodeMap = new HashMap<>();
		List<BuildingRouteResDTO> buildingRoutes = new ArrayList<>();
		List<LightNode> buildingNodes = new ArrayList<>();

		for (LightRoute route : routes) {

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

//		List<NodeInfoResDTO> nodeInfos = nodeMap.entrySet().stream()
//				.map(entry -> NodeInfoResDTO.of(entry.getKey(), entry.getValue().getLng(), entry.getValue().getLat()))
//				.toList();

		List<NodeInfoResDTO> nodeInfos = new ArrayList<>();

		for(LightNode node : nodeMap.values()) {
			nodeInfos.add(NodeInfoResDTO.of(node.getId(), node.getLng(), node.getLat()));
		}

		List<LightNode>startNode = determineStartNodes(adjMap, nodeMap);

		AllRoutesInfo result = AllRoutesInfo.of(nodeInfos, getCoreRoutes(adjMap, startNode), buildingRoutes);

		for(LightNode node : buildingNodes) {
			nodeInfos.add(NodeInfoResDTO.of(node.getId(), node.getLng(), node.getLat()));
		}

		return result;
	}

	private boolean isBuildingRoute(LightRoute route){
		return route.getDistance() > BUILDING_ROUTE_DISTANCE - 1;
	}

	private List<LightNode> determineStartNodes(Map<Long, List<LightRoute>> adjMap,
		Map<Long, LightNode> nodeMap) {
		return nodeMap.values().stream()
			.filter(node -> node.isCore()
				|| (adjMap.containsKey(node.getId()) && adjMap.get(node.getId()).size() == 1))
			.toList();
	}

	private List<CoreRouteResDTO> getCoreRoutes(Map<Long, List<LightRoute>> adjMap, List<LightNode> startNode) {
		List<CoreRouteResDTO> result = new ArrayList<>();
		// core node간의 BFS 할 때 방문여부를 체크하는 set
		Set<Long> visitedCoreNodes = new HashSet<>();
		// 길 중복을 처리하기 위한 set
		Set<Long> routeSet = new HashSet<>();

		// BFS 전처리
		Queue<LightNode> nodeQueue = new LinkedList<>();
		startNode.forEach(n-> {
			nodeQueue.add(n);
			visitedCoreNodes.add(n.getId());
		});

		// BFS
		while(!nodeQueue.isEmpty()) {
			// 현재 노드 (코어노드)
			LightNode now = nodeQueue.poll();
			for(LightRoute r : adjMap.get(now.getId())) {
				// 만약 now-nxt를 연결하는 길이 이미 등록되어있다면, 해당 coreRoute는 이미 등록된 것이므로 continue;
				if(routeSet.contains(r.getId())) continue;

				// 다음 노드 (서브노드일수도 있고 코어노드일 수도 있음)
				LightNode currentNode = now.getId() == r.getNode1().getId() ? r.getNode2() : r.getNode1();

				// 코어루트를 이루는 node들을 List로 저장
				List<RouteCoordinatesInfoResDTO> coreRoute = new ArrayList<>();
				coreRoute.add(RouteCoordinatesInfoResDTO.of(r.getId(),now.getId(), currentNode.getId()));
				routeSet.add(r.getId());

				while (true) {
					//코어노드를 만나면 queue에 넣을지 판단한 뒤 종료 (제자리로 돌아오는 경우도 포함)
					if (currentNode.isCore() || currentNode.getId() == now.getId()) {
						if (!visitedCoreNodes.contains(currentNode.getId())) {
							visitedCoreNodes.add(currentNode.getId());
							nodeQueue.add(currentNode);
						}
						break;
					}
					// 끝점인 경우 종료
					if (adjMap.get(currentNode.getId()).size() == 1) break;

					// 서브노드에 연결된 두 route 중 방문하지 않았던 route를 선택한 뒤, currentNode를 업데이트
					for (LightRoute R : adjMap.get(currentNode.getId())) {
						if (routeSet.contains(R.getId())) continue;
						LightNode nextNode = R.getNode1().getId() == currentNode.getId() ? R.getNode2() : R.getNode1();
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
}
