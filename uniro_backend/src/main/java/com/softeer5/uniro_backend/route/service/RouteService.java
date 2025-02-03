package com.softeer5.uniro_backend.route.service;

import java.util.*;
import java.util.stream.Collectors;

import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.DangerCautionConflictException;
import com.softeer5.uniro_backend.common.exception.custom.RouteNotFoundException;
import com.softeer5.uniro_backend.common.utils.Utils;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.route.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.repository.RouteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteService {
	private final RouteRepository routeRepository;


	public List<GetAllRoutesResDTO> getAllRoutes(Long univId) {
		List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

		// 맵이 존재하지 않을 경우 예외
		if(routes.isEmpty()) {
			throw new RouteNotFoundException("Route Not Found", ErrorCode.ROUTE_NOT_FOUND);
		}

		//인접 리스트
		Map<Long, List<Route>> adjMap = new HashMap<>();
		//BFS를 시작할 노드
		Node startNode = null;
		for(Route route : routes) {
			adjMap.computeIfAbsent(route.getNode1().getId(), k -> new ArrayList<>()).add(route);
			adjMap.computeIfAbsent(route.getNode2().getId(), k -> new ArrayList<>()).add(route);

			if(startNode != null) continue;
			if(route.getNode1().isCore()) startNode = route.getNode1();
			else if(route.getNode2().isCore()) startNode = route.getNode2();
		}

		// 맵에 코어노드가 없는 경우 서브노드끼리 순서 매겨서 리턴
		if(startNode==null){
			List<Long> endNodes = adjMap.entrySet()
					.stream()
					.filter(entry -> entry.getValue().size() == 1)  // 리스트 크기가 1인 항목 필터링
					.map(Map.Entry::getKey)
					.collect(Collectors.toList());

			Node
			//만약 끝 노드가 없는경우 서브노드끼리 사이클이 돌고있는 상황
			if(endNodes.isEmpty()){

			}

			//끝 노드가 2개인 경우 둘 중 하나에서 출발
			if(endNodes.size()==2){

			}

			getCoreRoutes(adjMap, startNode);

			// 예외처리 (유효하지 않는 맵)
		}

		List<List<Node>> coreRoutes = getCoreRoutes(adjMap, startNode);

		return coreRoutes.stream().map(GetAllRoutesResDTO::of).toList();
	}

	// coreRoute를 만들어주는 메서드
	private List<List<Node>> getCoreRoutes(Map<Long, List<Route>> adjMap, Node startNode) {
		List<List<Node>> result = new ArrayList<>();
		// core node간의 BFS 할 때 방문여부를 체크하는 set
		Set<Long> visitedCoreNodes = new HashSet<>();
		// 길 중복을 처리하기 위한 set
		Set<String> routeSet = new HashSet<>();

		// BFS 전처리
		Queue<Node> nodeQueue = new LinkedList<>();
		nodeQueue.add(startNode);
		visitedCoreNodes.add(startNode.getId());

		// BFS
		while(!nodeQueue.isEmpty()) {
			// 현재 노드 (코어노드)
			Node now = nodeQueue.poll();
			for(Route r : adjMap.get(now.getId())) {
				// 다음 노드 (서브노드일수도 있고 코어노드일 수도 있음)
				Node nxt = now.getId().equals(r.getNode1().getId()) ? r.getNode2() : r.getNode1();
				String hash = makeHash(now.getId(),nxt.getId());

				// 만약 now-nxt를 연결하는 길이 이미 등록되어있다면, 해당 coreRoute는 이미 등록된 것이므로 continue;
				if(routeSet.contains(hash)) continue;

				// 코어루트를 이루는 node들을 List로 저장
				List<Node> coreRoute = new ArrayList<>();
				// 코어루트에 중복된 node가 들어가지 않도록 판단하는 set
				Set<Long> visitedNodes = new HashSet<>();
				coreRoute.add(now);
				routeSet.add(makeHash(now.getId(),nxt.getId()));
				visitedNodes.add(now.getId());

				Node currentNode = nxt;
				while (true) {
					coreRoute.add(currentNode);
					visitedNodes.add(currentNode.getId());

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
						Node nextNode = R.getNode1().getId().equals(currentNode.getId()) ? R.getNode2() : R.getNode1();
						if (visitedNodes.contains(nextNode.getId())) continue;
						routeSet.add(makeHash(nextNode.getId(),currentNode.getId()));
						currentNode = nextNode;
					}
				}
				result.add(coreRoute);
			}

		}
		return result;
	}

	private String makeHash(Long id1, Long id2) {
		if(id1<id2){
			return id1 + "-" + id2;
		}
		return id2 + "-" + id1;
	}

	public GetRiskRoutesResDTO getRiskRoutes(Long univId) {
		List<Route> riskRoutes = routeRepository.findRiskRouteByUnivIdWithNode(univId);

		List<GetDangerResDTO> dangerRoutes = mapRoutesToDangerDTO(riskRoutes);
		List<GetCautionResDTO> cautionRoutes = mapRoutesToCautionDTO(riskRoutes);

		return GetRiskRoutesResDTO.of(dangerRoutes, cautionRoutes);
	}

	private List<GetDangerResDTO> mapRoutesToDangerDTO(List<Route> routes) {
		return routes.stream()
			.filter(route -> route.getDangerFactors() != null) // 위험 요소가 있는 경로만 필터링
			.map(route -> GetDangerResDTO.of(
				route.getNode1(),
				route.getNode2(),
				route.getId(),
				route.getDangerFactorsByList()
			)).toList();
	}

	private List<GetCautionResDTO> mapRoutesToCautionDTO(List<Route> routes) {
		return routes.stream()
			.filter(route -> route.getDangerFactors() == null && route.getCautionFactors() != null)
			.map(route -> GetCautionResDTO.of(
				route.getNode1(),
				route.getNode2(),
				route.getId(),
				route.getCautionFactorsByList()
			)).toList();
	}


	public GetRiskResDTO getRisk(Long univId, double startLat, double startLng, double endLat, double endLng) {
		String startWTK = Utils.convertDoubleToPointWTK(startLat, startLng);
		String endWTK = Utils.convertDoubleToPointWTK(endLat, endLng);

		Route routeWithJoin = routeRepository.findRouteByPointsAndUnivId(univId, startWTK ,endWTK)
				.orElseThrow(() -> new RouteNotFoundException("Route Not Found", ErrorCode.ROUTE_NOT_FOUND));

		/*
		// LineString 사용버전
		List<double[]> coordinates = Arrays.asList(
				new double[]{startLat, startLng},
				new double[]{endLat, endLng}
		);
		String lineStringWTK = Utils.convertDoubleToLineStringWTK(coordinates);
		Collections.reverse(coordinates);
		String reverseLineStringWTK = Utils.convertDoubleToLineStringWTK(coordinates);

		Route routeWithoutJoin = routeRepository.findRouteByLineStringAndUnivId(univId,lineStringWTK,reverseLineStringWTK)
				.orElseThrow(() -> new RouteNotFoundException("Route Not Found", ErrorCode.ROUTE_NOT_FOUND));

		 */


		return GetRiskResDTO.of(routeWithJoin);
	}

	@Transactional
	public void updateRisk(Long univId, Long routeId, PostRiskReqDTO postRiskReqDTO) {
		Route route = routeRepository.findByIdAndUnivId(routeId, univId)
				.orElseThrow(() -> new RouteNotFoundException("Route not Found", ErrorCode.ROUTE_NOT_FOUND));

		if(!postRiskReqDTO.getCautionTypes().isEmpty() && !postRiskReqDTO.getDangerTypes().isEmpty()){
			throw new DangerCautionConflictException("DangerFactors and CautionFactors can't exist simultaneously.",
					ErrorCode.CAUTION_DANGER_CANT_EXIST_SIMULTANEOUSLY);
		}

		route.setCautionFactors(postRiskReqDTO.getCautionTypes());
		route.setDangerFactors(postRiskReqDTO.getDangerTypes());
	}
}
