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
import com.softeer5.uniro_backend.external.redis.RedisService;
import com.softeer5.uniro_backend.external.MapClient;
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
import org.springframework.data.redis.core.ScanOptions;
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
	private final RevInfoRepository revInfoRepository;

	private final RouteCalculator routeCalculator;
	private final RouteCacheCalculator routeCacheCalculator;

	private final MapClient mapClient;

	private final RedisService redisService;

	private final Map<Long, List<LightRoute>> cache = new HashMap<>();

	public GetAllRoutesResDTO getAllRoutesByLocalCache(Long univId) {

		if(!cache.containsKey(univId)){
			List<Route> routes = routeRepository.findAllRouteByUnivIdWithNodes(univId);
			List<LightRoute> lightRoutes = routes.stream().map(LightRoute::new).toList();
			cache.put(univId, lightRoutes);
		}

		List<LightRoute> routes = cache.get(univId);

		// 맵이 존재하지 않을 경우 예외
		if(routes.isEmpty()) {
			throw new RouteException("Route Not Found", ROUTE_NOT_FOUND);
		}

		RevInfo revInfo = revInfoRepository.findFirstByUnivIdOrderByRevDesc(univId)
			.orElseThrow(() -> new RouteException("Revision not found", RECENT_REVISION_NOT_FOUND));

		AllRoutesInfo allRoutesInfo = routeCacheCalculator.assembleRoutes(routes);
		GetAllRoutesResDTO response = GetAllRoutesResDTO.of(allRoutesInfo.getNodeInfos(), allRoutesInfo.getCoreRoutes(),
			allRoutesInfo.getBuildingRoutes(), revInfo.getRev());

		return response;
	}

	public GetAllRoutesResDTO getAllRoutes(Long univId) {

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

		RevInfo revInfo = revInfoRepository.findFirstByUnivIdOrderByRevDesc(univId)
			.orElseThrow(() -> new RouteException("Revision not found", RECENT_REVISION_NOT_FOUND));

		AllRoutesInfo allRoutesInfo = routeCacheCalculator.assembleRoutes(routes);

		return GetAllRoutesResDTO.of(allRoutesInfo.getNodeInfos(), allRoutesInfo.getCoreRoutes(),
			allRoutesInfo.getBuildingRoutes(), revInfo.getRev());
	}

	@Async
	public void getAllRoutesByStream(Long univId, SseEmitter emitter) {
		String redisKeyPrefix = univId + ":";
		int batchNumber = 1;

		String startKey = redisKeyPrefix + batchNumber;
		boolean hasRedisData = redisService.hasData(startKey);

		try {
			// 1️⃣ Redis 데이터가 있다면 우선 처리
			if (hasRedisData) {
				log.info("🚀🚀🚀🚀🚀🚀🚀HIT🚀🚀🚀🚀🚀🚀🚀");
				while (true) {
					String redisKey = redisKeyPrefix + batchNumber;
					if (!redisService.hasData(redisKey)) {
						break; // 데이터가 없으면 종료
					}

					// Redis에서 데이터 가져오기
					LightRoutes lightRoutes = (LightRoutes) redisService.getData(redisKey);
					if (lightRoutes == null) {
						break;
					}

					List<LightRoute> batch = lightRoutes.getLightRoutes();

					// 배치 처리 후 SSE 전송
					processBatch(batch, emitter, batch.size());

					batchNumber++;
					// Thread.sleep(10); // 부하 방지
				}

				emitter.complete();
				log.info("[SSE emitter complete] Redis data used.");
				return;
			}

			// 2️⃣ Redis에 데이터가 없으면 기존 DB 조회 방식 사용
			try (Stream<Route> routeStream = routeRepository.findAllRouteByUnivIdWithNodesStream(univId)) {
				List<LightRoute> batch = new ArrayList<>(STREAM_FETCH_SIZE);
				Iterator<Route> iterator = routeStream.iterator();
				while (iterator.hasNext()) {
					Route route = iterator.next();
					batch.add(new LightRoute(route));
					entityManager.detach(route);

					if (batch.size() == STREAM_FETCH_SIZE) {
						LightRoutes value = new LightRoutes(batch);
						redisService.saveData(redisKeyPrefix + batchNumber, value);

						processBatch(batch, emitter, batch.size());
						batchNumber++;
					}
				}

				// 남은 배치 처리
				if (!batch.isEmpty()) {
					LightRoutes value = new LightRoutes(batch);
					redisService.saveData(univId + ":" + batchNumber, value);

					processBatch(batch, emitter, batch.size());
				}

				emitter.complete();
				log.info("[SSE emitter complete] DB data used.");
			}
		} catch (Exception e) {
			emitter.completeWithError(e);
			log.error("SSE error: " + e.getMessage());
		}
	}

	private void processBatch(List<LightRoute> batch, SseEmitter emitter, int size) throws Exception {
		if (!batch.isEmpty()) {
			AllRoutesInfo allRoutesInfo = routeCacheCalculator.assembleRoutes(batch);
			allRoutesInfo.setBatchSize(size);
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

		mapClient.fetchHeights(nodesForSave);

		List<Route> routes = routeCalculator.createLinkedRouteAndSave(univId, nodesForSave);

		nodeRepository.saveAll(nodesForSave);
		routeRepository.saveAll(routes);

		redisService.deleteData(univId.toString());

		return routeCalculator.assembleRoutes(routes);
	}
}
