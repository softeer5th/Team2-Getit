package com.softeer5.uniro_backend.map.service;

import static com.softeer5.uniro_backend.common.constant.UniroConst.BUILDING_ROUTE_COST;
import static com.softeer5.uniro_backend.common.constant.UniroConst.CORE_NODE_CONDITION;
import static com.softeer5.uniro_backend.common.error.ErrorCode.*;
import static com.softeer5.uniro_backend.common.utils.GeoUtils.getInstance;
import static com.softeer5.uniro_backend.common.utils.RouteUtils.isBuildingRoute;

import java.util.*;
import java.util.stream.Collectors;

import com.softeer5.uniro_backend.admin.annotation.RevisionOperation;
import com.softeer5.uniro_backend.admin.entity.RevisionOperationType;
import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.BuildingException;
import com.softeer5.uniro_backend.common.exception.custom.NodeException;
import com.softeer5.uniro_backend.common.exception.custom.RouteException;
import com.softeer5.uniro_backend.map.entity.Node;

import com.softeer5.uniro_backend.building.repository.BuildingRepository;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.dto.request.CreateBuildingRouteReqDTO;
import com.softeer5.uniro_backend.map.dto.response.*;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.map.dto.request.PostRiskReqDTO;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.repository.RouteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MapService {
	private final RouteRepository routeRepository;
	private final NodeRepository nodeRepository;
	private final BuildingRepository buildingRepository;
	private final RouteCalculationService routeCalculationService;


	public GetAllRoutesResDTO getAllRoutes(Long univId) {
		List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

		// 맵이 존재하지 않을 경우 예외
		if(routes.isEmpty()) {
			throw new RouteException("Route Not Found", ROUTE_NOT_FOUND);
		}

		//인접 리스트
		Map<Long, List<Route>> adjMap = new HashMap<>();
		Map<Long, Node> nodeMap = new HashMap<>();
		List<BuildingRouteResDTO> buildingRoutes = new ArrayList<>();
		//BFS를 시작할 노드
		Node startNode = null;
		for(Route route : routes) {
			nodeMap.put(route.getNode1().getId(), route.getNode1());
			nodeMap.put(route.getNode2().getId(), route.getNode2());
			if(isBuildingRoute(route)) {
				List<RouteCoordinatesInfoResDTO> routeCoordinates = new ArrayList<>();
				routeCoordinates.add(RouteCoordinatesInfoResDTO.of(route.getId(), route.getNode1().getId(),route.getNode2().getId()));
				buildingRoutes.add(BuildingRouteResDTO.of(route.getNode1().getId(), route.getNode2().getId(), routeCoordinates));
				continue;
			}
			adjMap.computeIfAbsent(route.getNode1().getId(), k -> new ArrayList<>()).add(route);
			adjMap.computeIfAbsent(route.getNode2().getId(), k -> new ArrayList<>()).add(route);

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
			}
			else if(endNodes.isEmpty()){
				//사이클인 경우 아무 노드나 코어노드로 설정
				startNode = routes.get(0).getNode1();
			}
			else{
				// 그 외의 경우의 수는 모두 사이클만 존재하거나, 규칙에 어긋난 맵
				throw new RouteException("Invalid Map", ErrorCode.INVALID_MAP);
			}


		}

		return GetAllRoutesResDTO.of(nodeInfos, routeCalculationService.getCoreRoutes(adjMap, startNode), buildingRoutes);
	}

	public GetRiskRoutesResDTO getRiskRoutes(Long univId) {
		List<Route> riskRoutes = routeRepository.findRiskRouteByUnivId(univId);

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


	public GetRiskResDTO getRisk(Long univId, Long routeId) {
		Route route = routeRepository.findById(routeId)
			.orElseThrow(() -> new RouteException("Route not found", ROUTE_NOT_FOUND));
		return GetRiskResDTO.of(route);
	}

	@RevisionOperation(RevisionOperationType.UPDATE_RISK)
	@Transactional
	public void updateRisk(Long univId, Long routeId, PostRiskReqDTO postRiskReqDTO) {
		Route route = routeRepository.findByIdAndUnivId(routeId, univId)
				.orElseThrow(() -> new RouteException("Route not Found", ROUTE_NOT_FOUND));

		if(!postRiskReqDTO.getCautionFactors().isEmpty() && !postRiskReqDTO.getDangerFactors().isEmpty()){
			throw new RouteException("DangerFactors and CautionFactors can't exist simultaneously.",
					ErrorCode.CAUTION_DANGER_CANT_EXIST_SIMULTANEOUSLY);
		}

		route.setCautionFactors(postRiskReqDTO.getCautionFactors());
		route.setDangerFactors(postRiskReqDTO.getDangerFactors());
	}

	@RevisionOperation(RevisionOperationType.CREATE_BUILDING_ROUTE)
	@Transactional
	public void createBuildingRoute(Long univId, CreateBuildingRouteReqDTO createBuildingRouteReqDTO) {
		GeometryFactory geometryFactory = getInstance();
		Long buildingNodeId = createBuildingRouteReqDTO.getBuildingNodeId();
		Long nodeId = createBuildingRouteReqDTO.getNodeId();

		if(!buildingRepository.existsByNodeIdAndUnivId(buildingNodeId, univId)) {
			throw new BuildingException("Not Building Node", NOT_BUILDING_NODE);
		}

		Node buildingNode = nodeRepository.findById(buildingNodeId)
				.orElseThrow(()-> new NodeException("Node not found", NODE_NOT_FOUND));

		Node connectedNode = nodeRepository.findById(nodeId)
				.orElseThrow(()-> new NodeException("Node not found", NODE_NOT_FOUND));

		int connectedRouteCount = routeRepository.countByUnivIdAndNodeId(univId, nodeId);
		if(connectedRouteCount>=2){
			connectedNode.setCore(true);
		}

		int buildingRouteCount = routeRepository.countByUnivIdAndNodeId(univId, buildingNodeId);
		if(buildingRouteCount>=CORE_NODE_CONDITION-1){
			buildingNode.setCore(true);
		}

		Route route = Route.builder()
				.cost(BUILDING_ROUTE_COST)
				.path(geometryFactory.createLineString(
						new Coordinate[] {buildingNode.getCoordinates().getCoordinate(),
								connectedNode.getCoordinates().getCoordinate()}))
				.node1(buildingNode)
				.node2(connectedNode)
				.cautionFactors(Collections.EMPTY_SET)
				.dangerFactors(Collections.EMPTY_SET)
				.univId(univId).build();

		routeRepository.save(route);
	}
}
