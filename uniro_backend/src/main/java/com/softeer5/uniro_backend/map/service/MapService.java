package com.softeer5.uniro_backend.map.service;

import static com.softeer5.uniro_backend.common.constant.UniroConst.*;
import static com.softeer5.uniro_backend.common.error.ErrorCode.*;
import static com.softeer5.uniro_backend.common.utils.GeoUtils.getInstance;

import java.util.*;
import java.util.stream.Stream;

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
import com.softeer5.uniro_backend.external.event.RouteCreatedEvent;
import com.softeer5.uniro_backend.external.redis.RedisService;
import com.softeer5.uniro_backend.map.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.map.entity.Node;

import com.softeer5.uniro_backend.building.repository.BuildingRepository;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.dto.request.CreateBuildingRouteReqDTO;
import com.softeer5.uniro_backend.map.dto.response.*;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.map.dto.request.PostRiskReqDTO;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.repository.RouteRepository;
import com.softeer5.uniro_backend.map.service.vo.LightRoute;
import com.softeer5.uniro_backend.map.service.vo.LightRoutes;

import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MapService {
	private final RouteRepository routeRepository;
	private final EntityManager entityManager;
	private final NodeRepository nodeRepository;
	private final BuildingRepository buildingRepository;
	private final ApplicationEventPublisher eventPublisher;

	private final RouteCalculator routeCalculator;
	private final RouteCacheCalculator routeCacheCalculator;

	private final RedisService redisService;

	private final Map<Long, List<LightRoute>> cache = new HashMap<>();


	public AllRoutesInfo getAllRoutes(Long univId) {

		if(!redisService.hasData(univId.toString())){
			List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);
			List<LightRoute> lightRoutes = routes.stream().map(LightRoute::new).toList();
			LightRoutes value = new LightRoutes(lightRoutes);
			redisService.saveData(univId.toString(), value);
		}
		else{
			log.info("🚀🚀🚀🚀🚀🚀🚀HIT🚀🚀🚀🚀🚀🚀🚀");
		}

		LightRoutes lightRoutes = (LightRoutes) redisService.getData(univId.toString());
		List<LightRoute> routes = lightRoutes.getLightRoutes();

		// 맵이 존재하지 않을 경우 예외
		if(routes.isEmpty()) {
			throw new RouteException("Route Not Found", ROUTE_NOT_FOUND);
		}

		return routeCacheCalculator.assembleRoutes(routes);
	}

	public AllRoutesInfo getAllRoutesByStream(Long univId) {
		List<NodeInfoResDTO> nodeInfos = new ArrayList<>();
		List<CoreRouteResDTO> coreRoutes = new ArrayList<>();
		List<BuildingRouteResDTO> buildingRoutes = new ArrayList<>();

		String redisKeyPrefix = univId + ":";
		int batchNumber = 1;

		if (!processRedisDataByStream(redisKeyPrefix, batchNumber, nodeInfos, coreRoutes, buildingRoutes)) {
			processDatabaseDataByStream(univId, redisKeyPrefix, batchNumber, nodeInfos, coreRoutes, buildingRoutes);
		}

		return AllRoutesInfo.of(nodeInfos, coreRoutes, buildingRoutes);
	}

	private boolean processRedisDataByStream(String redisKeyPrefix,
											 int batchNumber,
											 List<NodeInfoResDTO> nodeInfos,
											 List<CoreRouteResDTO> coreRoutes,
											 List<BuildingRouteResDTO> buildingRoutes){
		while (redisService.hasData(redisKeyPrefix + batchNumber)) {
			LightRoutes lightRoutes = (LightRoutes) redisService.getData(redisKeyPrefix + batchNumber);
			if (lightRoutes == null) {
				break;
			}

			processBatchByStream(lightRoutes.getLightRoutes(), nodeInfos, coreRoutes, buildingRoutes);
			batchNumber++;
		}

        return batchNumber > 1;
    }

	private void processDatabaseDataByStream(Long univId, String redisKeyPrefix, int batchNumber,
											 List<NodeInfoResDTO> nodeInfos,
											 List<CoreRouteResDTO> coreRoutes,
											 List<BuildingRouteResDTO> buildingRoutes) {
		int fetchSize = routeRepository.countByUnivId(univId);
		int remain = fetchSize%STREAM_FETCH_SIZE;
		fetchSize = fetchSize/STREAM_FETCH_SIZE + (remain > 0 ? 1 : 0);

		try (Stream<LightRoute> routeStream = routeRepository.findAllLightRoutesByUnivId(univId)) {
			List<LightRoute> batch = new ArrayList<>(STREAM_FETCH_SIZE);
			for (LightRoute route : (Iterable<LightRoute>) routeStream::iterator) {
				batch.add(route);

				if (batch.size() == STREAM_FETCH_SIZE) {
					saveAndSendBatchByStream(redisKeyPrefix, batchNumber++, batch, nodeInfos, coreRoutes, buildingRoutes);
				}
			}

			// 남은 배치 처리
			if (!batch.isEmpty()) {
				saveAndSendBatchByStream(redisKeyPrefix, batchNumber, batch, nodeInfos, coreRoutes, buildingRoutes);
			}

			redisService.saveDataToString(univId.toString() + ":fetch", String.valueOf(fetchSize));
		}

	}

	private void saveAndSendBatchByStream(String redisKeyPrefix, int batchNumber, List<LightRoute> batch,
										  List<NodeInfoResDTO> nodeInfos,
										  List<CoreRouteResDTO> coreRoutes,
										  List<BuildingRouteResDTO> buildingRoutes) {
		LightRoutes value = new LightRoutes(batch);
		redisService.saveData(redisKeyPrefix + batchNumber, value);
		processBatchByStream(batch, nodeInfos, coreRoutes, buildingRoutes);
		batch.clear();
	}

	private void processBatchByStream(List<LightRoute> batch,
									  List<NodeInfoResDTO> nodeInfos,
									  List<CoreRouteResDTO> coreRoutes,
									  List<BuildingRouteResDTO> buildingRoutes) {
		if (!batch.isEmpty()) {
			AllRoutesInfo allRoutesInfo = routeCacheCalculator.assembleRoutes(batch);
			nodeInfos.addAll(allRoutesInfo.getNodeInfos());
			coreRoutes.addAll(allRoutesInfo.getCoreRoutes());
			buildingRoutes.addAll(allRoutesInfo.getBuildingRoutes());
			batch.clear();
			entityManager.clear();
		}
	}

	@Async
	public void getAllRoutesBySSE(Long univId, SseEmitter emitter) {
		String redisKeyPrefix = univId + ":";
		int batchNumber = 1;

		try {
			// 1️⃣ Redis 데이터가 있다면 우선 처리
			if (processRedisData(univId, redisKeyPrefix, batchNumber, emitter)) {
				return;
			}

			// 2️⃣ Redis에 데이터가 없으면 기존 DB 조회 방식 사용
			processDatabaseData(univId, redisKeyPrefix, batchNumber, emitter);
		} catch (Exception e) {
			emitter.completeWithError(e);
			log.error("SSE error: {}", e.getMessage(), e);
		}
	}

	private boolean processRedisData(Long univId, String redisKeyPrefix, int batchNumber, SseEmitter emitter) throws Exception {
		while (redisService.hasData(redisKeyPrefix + batchNumber)) {
			LightRoutes lightRoutes = (LightRoutes) redisService.getData(redisKeyPrefix + batchNumber);
			if (lightRoutes == null) {
				break;
			}

			Integer fetchSize = Integer.parseInt(redisService.getDataToString(univId.toString() + ":fetch"));

			processBatch(lightRoutes.getLightRoutes(), emitter, fetchSize);
			batchNumber++;
		}

		if (batchNumber > 1) {
			emitter.complete();
			log.info("[SSE emitter complete] Redis data used.");
			return true;
		}
		return false;
	}

	private void processDatabaseData(Long univId, String redisKeyPrefix, int batchNumber, SseEmitter emitter) {
		int fetchSize = routeRepository.countByUnivId(univId);
		int remain = fetchSize%STREAM_FETCH_SIZE;
		fetchSize = fetchSize/STREAM_FETCH_SIZE + (remain > 0 ? 1 : 0);

		try (Stream<LightRoute> routeStream = routeRepository.findAllLightRoutesByUnivId(univId)) {
			List<LightRoute> batch = new ArrayList<>(STREAM_FETCH_SIZE);
			for (LightRoute route : (Iterable<LightRoute>) routeStream::iterator) {
				batch.add(route);

				if (batch.size() == STREAM_FETCH_SIZE) {
					saveAndSendBatch(redisKeyPrefix, batchNumber++, batch, emitter, fetchSize);
				}
			}

			// 남은 배치 처리
			if (!batch.isEmpty()) {
				saveAndSendBatch(redisKeyPrefix, batchNumber, batch, emitter, fetchSize);
			}

			redisService.saveDataToString(univId.toString() + ":fetch", String.valueOf(fetchSize));
			emitter.complete();
			log.info("[SSE emitter complete] DB data used.");
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	private void saveAndSendBatch(String redisKeyPrefix, int batchNumber, List<LightRoute> batch, SseEmitter emitter, Integer fetchSize)
		throws Exception {
		LightRoutes value = new LightRoutes(batch);
		redisService.saveData(redisKeyPrefix + batchNumber, value);
		processBatch(batch, emitter, fetchSize);
		batch.clear();
	}

	private void processBatch(List<LightRoute> batch, SseEmitter emitter, int fetchSize) throws Exception {
		if (!batch.isEmpty()) {
			AllRoutesInfo allRoutesInfo = routeCacheCalculator.assembleRoutes(batch);
			allRoutesInfo.setBatchSize(fetchSize);
			emitter.send(allRoutesInfo);
			batch.clear();
			entityManager.clear();
		}
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
	public synchronized AllRoutesInfo createRoute(Long univId, CreateRoutesReqDTO requests){

		if(requests.getCoordinates().size() >= CREATE_ROUTE_LIMIT_COUNT){
			throw new RouteException("creat route limit exceeded", CREATE_ROUTE_LIMIT_EXCEEDED);
		}

		List<Route> savedRoutes = routeRepository.findAllRouteByUnivIdWithNodes(univId);

		List<Node> nodesForSave = routeCalculator.createValidRouteNodes(univId, requests.getStartNodeId(),
			requests.getEndNodeId(),
			requests.getCoordinates(), savedRoutes);


		List<Route> routes = routeCalculator.createLinkedRouteAndSave(univId, nodesForSave);

		nodeRepository.saveAll(nodesForSave);
		routeRepository.saveAll(routes);

		int routeCount = routeRepository.countByUnivId(univId);

		redisService.deleteRoutesData(univId.toString(), routeCount / STREAM_FETCH_SIZE + 1);

		eventPublisher.publishEvent(new RouteCreatedEvent());
		return routeCalculator.assembleRoutes(routes);
	}
}
