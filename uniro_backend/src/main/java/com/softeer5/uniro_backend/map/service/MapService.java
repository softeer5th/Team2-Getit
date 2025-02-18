package com.softeer5.uniro_backend.map.service;

import static com.softeer5.uniro_backend.common.constant.UniroConst.BUILDING_ROUTE_DISTANCE;
import static com.softeer5.uniro_backend.common.constant.UniroConst.CORE_NODE_CONDITION;
import static com.softeer5.uniro_backend.common.error.ErrorCode.*;
import static com.softeer5.uniro_backend.common.utils.GeoUtils.getInstance;

import java.util.*;
import java.util.stream.Stream;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.softeer5.uniro_backend.admin.annotation.RevisionOperation;
import com.softeer5.uniro_backend.admin.entity.RevInfo;
import com.softeer5.uniro_backend.admin.enums.RevisionOperationType;
import com.softeer5.uniro_backend.admin.repository.RevInfoRepository;
import com.softeer5.uniro_backend.building.entity.Building;
import com.softeer5.uniro_backend.common.error.ErrorCode;
import com.softeer5.uniro_backend.common.exception.custom.BuildingException;
import com.softeer5.uniro_backend.common.exception.custom.NodeException;
import com.softeer5.uniro_backend.common.exception.custom.RouteCalculationException;
import com.softeer5.uniro_backend.common.exception.custom.RouteException;
import com.softeer5.uniro_backend.external.MapClient;
import com.softeer5.uniro_backend.map.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.map.entity.Node;

import com.softeer5.uniro_backend.building.repository.BuildingRepository;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.dto.request.CreateBuildingRouteReqDTO;
import com.softeer5.uniro_backend.map.dto.response.*;
import jakarta.persistence.EntityManager;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.map.dto.request.PostRiskReqDTO;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.repository.RouteRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MapService {
	private final RouteRepository routeRepository;
	private final NodeRepository nodeRepository;
	private final BuildingRepository buildingRepository;
	private final RevInfoRepository revInfoRepository;
	private final EntityManager entityManager;

	private final RouteCalculator routeCalculator;

	private final MapClient mapClient;

	ObjectMapper mapper = new ObjectMapper();

	public GetAllRoutesResDTO getAllRoutes(Long univId) {
		List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

		// 맵이 존재하지 않을 경우 예외
		if(routes.isEmpty()) {
			throw new RouteException("Route Not Found", ROUTE_NOT_FOUND);
		}

		RevInfo revInfo = revInfoRepository.findFirstByUnivIdOrderByRevDesc(univId)
			.orElseThrow(() -> new RouteException("Revision not found", RECENT_REVISION_NOT_FOUND));

		AllRoutesInfo allRoutesInfo = routeCalculator.assembleRoutes(routes);

		return GetAllRoutesResDTO.of(allRoutesInfo.getNodeInfos(), allRoutesInfo.getCoreRoutes(),
			allRoutesInfo.getBuildingRoutes(), revInfo.getRev());
	}

	@Async
	public void getAllRoutesByStream(Long univId, SseEmitter emitter) {
			try (Stream<Route> routeStream = routeRepository.findAllRouteByUnivIdWithNodesStream(univId)) {
				List<Route> batch = new ArrayList<>(2500);
				Iterator<Route> iterator = routeStream.iterator();
				while (iterator.hasNext()) {
					Route route = iterator.next();
					batch.add(route);
					entityManager.detach(route);

					// 500건 모이면 배치 처리
					if (batch.size() == 2500) {
						AllRoutesInfo allRoutesInfo = routeCalculator.assembleRoutes(batch);
						emitter.send(allRoutesInfo);
						batch.clear();
						entityManager.clear();
					}
				}

				// 남은 배치 처리
				if (!batch.isEmpty()) {
					AllRoutesInfo allRoutesInfo = routeCalculator.assembleRoutes(batch);
					emitter.send(allRoutesInfo);
					batch.clear();
					entityManager.clear();
				}

				emitter.complete();
			}
			catch (Exception e) {
				emitter.completeWithError(e);
			}
	}

	public GetAllRoutesResDTO getAllRoutesWithNoSSE(Long univId) {
		List<NodeInfoResDTO> nodeInfos = new ArrayList<>();
		List<CoreRouteResDTO> coreRoutes = new ArrayList<>();
		List<BuildingRouteResDTO> buildingRoutes = new ArrayList<>();

		try (Stream<Route> routeStream = routeRepository.findAllRouteByUnivIdWithNodesStream(univId)) {
			List<Route> batch = new ArrayList<>(500);
			Iterator<Route> iterator = routeStream.iterator();
			while (iterator.hasNext()) {
				Route route = iterator.next();
				batch.add(route);
				entityManager.detach(route);

				// 100건 모이면 배치 처리
				if (batch.size() == 500) {
					AllRoutesInfo allRoutesInfo = routeCalculator.assembleRoutes(batch);
					nodeInfos.addAll(allRoutesInfo.getNodeInfos());
					coreRoutes.addAll(allRoutesInfo.getCoreRoutes());
					buildingRoutes.addAll(allRoutesInfo.getBuildingRoutes());
					batch.clear();
					entityManager.clear();
				}
			}

			// 남은 배치 처리
			if (!batch.isEmpty()) {
				AllRoutesInfo allRoutesInfo = routeCalculator.assembleRoutes(batch);
				nodeInfos.addAll(allRoutesInfo.getNodeInfos());
				coreRoutes.addAll(allRoutesInfo.getCoreRoutes());
				buildingRoutes.addAll(allRoutesInfo.getBuildingRoutes());
				batch.clear();
				entityManager.clear();
			}

		}

		return GetAllRoutesResDTO.of(nodeInfos,coreRoutes,buildingRoutes,1L);
	}

	public String getAllRoutesWithString(Long univId) {
		//List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);
		StringBuilder nodeInfos = new StringBuilder();
		StringBuilder coreRoutes = new StringBuilder();
		StringBuilder buildingInfos = new StringBuilder();

		try (Stream<Route> routeStream = routeRepository.findAllRouteByUnivIdWithNodesStream(univId)) {
			List<Route> batch = new ArrayList<>(100);
			Iterator<Route> iterator = routeStream.iterator();
			int a = 0;
			while (iterator.hasNext()) {
				a++;
				Route route = iterator.next();
				batch.add(route);
				entityManager.detach(route);
				// 1000건 모이면 처리
				if (batch.size() == 100) {
					AllRoutesInfo allRoutesInfo = routeCalculator.assembleRoutes(batch);  // 배치 처리 로직 실행
					try {
						nodeInfos.append(mapper.writeValueAsString(allRoutesInfo.getNodeInfos()));
						coreRoutes.append(mapper.writeValueAsString(allRoutesInfo.getCoreRoutes()));
						buildingInfos.append(mapper.writeValueAsString(allRoutesInfo.getBuildingRoutes()));
					} catch (JsonProcessingException e) {

					}
					batch.forEach(entityManager::detach); // 메모리에서 detach
					batch.clear();
					entityManager.clear();
				}
			}

			// 남은 데이터 처리
			if (!batch.isEmpty()) {
				batch.forEach(entityManager::detach);
			}
		}

		StringBuilder result = new StringBuilder();
		result.append("{\"nodeInfos\": ").append(nodeInfos).append(",\"coreRoutes\": ").append(coreRoutes).append(",\"buildingInfos\": ").append(buildingInfos).append("}");
		return result.toString();
	}

		public List<FastestRouteResDTO> findFastestRoute(Long univId, Long startNodeId, Long endNodeId){

		if(startNodeId.equals(endNodeId)){
			throw new RouteCalculationException("Start and end nodes cannot be the same", SAME_START_AND_END_POINT);
		}

		List<Building> buildings = buildingRepository.findAllByNodeIdIn(List.of(startNodeId, endNodeId));

		if(buildings.size() != 2
			|| buildings.get(0).getNodeId().equals(buildings.get(1).getNodeId())
			|| buildings.stream().anyMatch(building -> !Objects.equals(building.getUnivId(), univId))){

			throw new BuildingException("Building not found", BUILDING_NOT_FOUND);
		}

		List<Route> routesWithNode = routeRepository.findAllRouteByUnivIdWithNodes(univId);

		return routeCalculator.calculateFastestRoute(startNodeId, endNodeId, routesWithNode);
	}

	public GetRiskRoutesResDTO getRiskRoutes(Long univId) {
		List<Route> riskRoutes = routeRepository.findRiskRouteByUnivId(univId);
		return routeCalculator.mapRisks(riskRoutes);
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

		route.setCautionFactorsByList(postRiskReqDTO.getCautionFactors());
		route.setDangerFactorsByList(postRiskReqDTO.getDangerFactors());
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
		if(connectedRouteCount>= CORE_NODE_CONDITION - 1){
			connectedNode.setCore(true);
		}

		int buildingRouteCount = routeRepository.countByUnivIdAndNodeId(univId, buildingNodeId);
		if(buildingRouteCount>=CORE_NODE_CONDITION-1){
			buildingNode.setCore(true);
		}

		Route route = Route.builder()
				.distance(BUILDING_ROUTE_DISTANCE)
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

	@Transactional
	@RevisionOperation(RevisionOperationType.CREATE_ROUTE)
	synchronized public void createRoute(Long univId, CreateRoutesReqDTO requests){

		List<Route> savedRoutes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

		List<Node> nodesForSave = routeCalculator.createValidRouteNodes(univId, requests.getStartNodeId(),
			requests.getEndNodeId(),
			requests.getCoordinates(), savedRoutes);

		mapClient.fetchHeights(nodesForSave);

		List<Route> routes = routeCalculator.createLinkedRouteAndSave(univId, nodesForSave);

		nodeRepository.saveAll(nodesForSave);
		routeRepository.saveAll(routes);
	}
}
