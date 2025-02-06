package com.softeer5.uniro_backend.route.service;

import static com.softeer5.uniro_backend.common.error.ErrorCode.*;

import java.util.*;
import java.util.stream.Collectors;

import com.softeer5.uniro_backend.admin.annotation.RevisionOperation;
import com.softeer5.uniro_backend.admin.entity.RevisionOperationType;
import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.DangerCautionConflictException;
import com.softeer5.uniro_backend.common.exception.custom.InvalidMapException;
import com.softeer5.uniro_backend.common.exception.custom.RouteNotFoundException;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.common.utils.GeoUtils;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.route.dto.response.CoreRouteResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetAllRoutesResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetCautionResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetDangerResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetRiskResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetRiskRoutesResDTO;
import com.softeer5.uniro_backend.route.dto.response.NodeInfoResDTO;
import com.softeer5.uniro_backend.route.dto.request.PostRiskReqDTO;
import com.softeer5.uniro_backend.route.dto.response.RouteCoordinatesInfoResDTO;
import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.repository.RouteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteService {
	private final RouteRepository routeRepository;


	public GetAllRoutesResDTO getAllRoutes(Long univId) {
		List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

		// 맵이 존재하지 않을 경우 예외
		if(routes.isEmpty()) {
			throw new RouteNotFoundException("Route Not Found", ROUTE_NOT_FOUND);
		}

		//인접 리스트
		Map<Long, List<Route>> adjMap = new HashMap<>();
		Map<Long, Node> nodeMap = new HashMap<>();
		//BFS를 시작할 노드
		Node startNode = null;
		for(Route route : routes) {
			adjMap.computeIfAbsent(route.getNode1().getId(), k -> new ArrayList<>()).add(route);
			adjMap.computeIfAbsent(route.getNode2().getId(), k -> new ArrayList<>()).add(route);
			nodeMap.put(route.getNode1().getId(), route.getNode1());
			nodeMap.put(route.getNode2().getId(), route.getNode2());

			if(startNode != null) continue;
			if(route.getNode1().isCore()) startNode = route.getNode1();
			else if(route.getNode2().isCore()) startNode = route.getNode2();
		}

		List<NodeInfoResDTO> nodeInfos = nodeMap.entrySet().stream()
				.map(entry -> {
					Node node = entry.getValue();
					return NodeInfoResDTO.of(entry.getKey(), node.getX(), node.getY());
				})
				.collect(Collectors.toList());

		// 맵에 코어노드가 없는 경우 서브노드끼리 순서 매겨서 리턴
		if(startNode==null){
			List<Long> endNodes = adjMap.entrySet()
					.stream()
					.filter(entry -> entry.getValue().size() == 1)  // 리스트 크기가 1인 항목 필터링
					.map(Map.Entry::getKey)
					.collect(Collectors.toList());

			//끝 노드가 2개인 경우 둘 중 하나에서 출발
			if(endNodes.size()==2){
				startNode = nodeMap.get(endNodes.get(0));
				return GetAllRoutesResDTO.of(nodeInfos, List.of(getSingleRoutes(adjMap, startNode)));
			}

			// 그 외의 경우의 수는 모두 사이클만 존재하거나, 규칙에 어긋난 맵
			throw new InvalidMapException("Invalid Map", ErrorCode.INVALID_MAP);

		}


		return GetAllRoutesResDTO.of(nodeInfos, getCoreRoutes(adjMap, startNode));
	}

	// coreRoute를 만들어주는 메서드
	private List<CoreRouteResDTO> getCoreRoutes(Map<Long, List<Route>> adjMap, Node startNode) {
		List<CoreRouteResDTO> result = new ArrayList<>();
		// core node간의 BFS 할 때 방문여부를 체크하는 set
		Set<Long> visitedCoreNodes = new HashSet<>();
		// 길 중복을 처리하기 위한 set
		Set<Long> routeSet = new HashSet<>();

		// BFS 전처리
		Queue<Node> nodeQueue = new LinkedList<>();
		nodeQueue.add(startNode);
		visitedCoreNodes.add(startNode.getId());

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
					//코어노드를 만나면 queue에 넣을지 판단한 뒤 종료
					if (currentNode.isCore()) {
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

	private CoreRouteResDTO getSingleRoutes(Map<Long, List<Route>> adjMap, Node startNode) {
		List<RouteCoordinatesInfoResDTO> coreRoute = new ArrayList<>();
		Set<Long> visitedNodes = new HashSet<>();
		visitedNodes.add(startNode.getId());


		Node currentNode = startNode;
		boolean flag = true;
		while(flag){
			flag = false;
			for (Route r : adjMap.get(currentNode.getId())) {
				Node nextNode = r.getNode1().getId().equals(currentNode.getId()) ? r.getNode2() : r.getNode1();
				if(visitedNodes.contains(nextNode.getId())) continue;
				coreRoute.add(RouteCoordinatesInfoResDTO.of(r.getId(), currentNode.getId(), nextNode.getId()));
				flag = true;
				currentNode = nextNode;
			}
		}
		return CoreRouteResDTO.of(startNode.getId(), currentNode.getId(), coreRoute);
	}

	public GetRiskRoutesResDTO getRiskRoutes(Long univId) {
		List<Route> riskRoutes = routeRepository.findRiskRouteByUnivIdWithNode(univId);

		List<GetDangerResDTO> dangerRoutes = mapRoutesToDangerDTO(riskRoutes);
		List<GetCautionResDTO> cautionRoutes = mapRoutesToCautionDTO(riskRoutes);

		return GetRiskRoutesResDTO.of(dangerRoutes, cautionRoutes);
	}

	private List<GetDangerResDTO> mapRoutesToDangerDTO(List<Route> routes) {
		return routes.stream()
			.filter(route -> !route.getDangerFactors().isEmpty() && route.getCautionFactors().isEmpty()) // 위험 요소가 있는 경로만 필터링
			.map(route -> GetDangerResDTO.of(
				route.getNode1(),
				route.getNode2(),
				route.getId(),
				route.getDangerFactorsByList()
			)).toList();
	}

	private List<GetCautionResDTO> mapRoutesToCautionDTO(List<Route> routes) {
		return routes.stream()
			.filter(route -> route.getDangerFactors().isEmpty() && !route.getCautionFactors().isEmpty())
			.map(route -> GetCautionResDTO.of(
				route.getNode1(),
				route.getNode2(),
				route.getId(),
				route.getCautionFactorsByList()
			)).toList();
	}


	public GetRiskResDTO getRisk(Long univId, Long routeId) {
		Route route = routeRepository.findById(routeId)
			.orElseThrow(() -> new RouteNotFoundException("Route not found", ROUTE_NOT_FOUND));
		return GetRiskResDTO.of(route);
	}

	@RevisionOperation(RevisionOperationType.UPDATE_RISK)
	@Transactional
	public void updateRisk(Long univId, Long routeId, PostRiskReqDTO postRiskReqDTO) {
		Route route = routeRepository.findByIdAndUnivId(routeId, univId)
				.orElseThrow(() -> new RouteNotFoundException("Route not Found", ROUTE_NOT_FOUND));

		if(!postRiskReqDTO.getCautionTypes().isEmpty() && !postRiskReqDTO.getDangerTypes().isEmpty()){
			throw new DangerCautionConflictException("DangerFactors and CautionFactors can't exist simultaneously.",
					ErrorCode.CAUTION_DANGER_CANT_EXIST_SIMULTANEOUSLY);
		}

		route.setCautionFactors(postRiskReqDTO.getCautionTypes());
		route.setDangerFactors(postRiskReqDTO.getDangerTypes());
	}
}
