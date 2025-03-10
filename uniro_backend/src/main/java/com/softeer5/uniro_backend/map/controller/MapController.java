package com.softeer5.uniro_backend.map.controller;

import com.softeer5.uniro_backend.admin.service.AdminService;
import com.softeer5.uniro_backend.map.dto.request.CreateBuildingRouteReqDTO;
import com.softeer5.uniro_backend.map.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.map.dto.response.*;
import com.softeer5.uniro_backend.map.dto.request.PostRiskReqDTO;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.softeer5.uniro_backend.map.service.MapService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class MapController implements MapApi {

	private final MapService mapService;
	private final AdminService adminService;

	@Override
	@GetMapping("/{univId}/routes")
	public ResponseEntity<AllRoutesInfo> getAllRoutesAndNodes(@PathVariable("univId") Long univId){
		AllRoutesInfo allRoutes = mapService.getAllRoutes(univId);
		return ResponseEntity.ok().body(allRoutes);
	}

	@Override
	@GetMapping("/{univId}/routes/stream")
	public ResponseEntity<AllRoutesInfo> getAllRoutesAndNodesStream(@PathVariable("univId") Long univId){
		AllRoutesInfo allRoutes = mapService.getAllRoutesByStream(univId);
		return ResponseEntity.ok().body(allRoutes);
	}

	@Override
	@GetMapping("/{univId}/routes/sse")
	public SseEmitter getAllRoutes(@PathVariable("univId") Long univId){
		SseEmitter emitter = new SseEmitter(60 * 1000L); // timeout 1분
		mapService.getAllRoutesBySSE(univId, emitter);
		return emitter;
	}

	@Override
	@GetMapping("/{univId}/routes/risks")
	public ResponseEntity<GetRiskRoutesResDTO> getRiskRoutes(@PathVariable("univId") Long univId) {
		GetRiskRoutesResDTO riskRoutes = mapService.getRiskRoutes(univId);
		return ResponseEntity.ok().body(riskRoutes);
	}

	@Override
	@GetMapping("/{univId}/routes/{routeId}/risk")
	public ResponseEntity<GetRiskResDTO> getRisk(@PathVariable("univId") Long univId,
												 @PathVariable(value = "routeId") Long routeId){
		GetRiskResDTO riskResDTO = mapService.getRisk(univId, routeId);
		return ResponseEntity.ok().body(riskResDTO);
	}

	@Override
	@PostMapping("/{univId}/route/risk/{routeId}")
	public ResponseEntity<Void> updateRisk (@PathVariable("univId") Long univId,
									   @PathVariable("routeId") Long routeId,
									   @RequestBody @Valid PostRiskReqDTO postRiskReqDTO){
		mapService.updateRisk(univId,routeId,postRiskReqDTO);
		return ResponseEntity.ok().build();
	}

	@Override
	@PostMapping("/{univId}/route")
	public ResponseEntity<AllRoutesInfo> createRoute (@PathVariable("univId") Long univId,
											 @RequestBody @Valid CreateRoutesReqDTO routes){
		AllRoutesInfo createdRoutes = mapService.createRoute(univId, routes);
		return ResponseEntity.ok().body(createdRoutes);
	}

	@Override
	@GetMapping("/{univId}/routes/fastest")
	public ResponseEntity<List<FastestRouteResDTO>> findFastestRoute(@PathVariable("univId") Long univId,
																	 @RequestParam(value = "start-node-id") Long startNodeId,
																	 @RequestParam(value = "end-node-id") Long endNodeId) {
		List<FastestRouteResDTO> fastestRouteResDTO = mapService.findFastestRoute(univId, startNodeId, endNodeId);
		return ResponseEntity.ok(fastestRouteResDTO);
	}

	@Override
	@PostMapping("/{univId}/routes/building")
	public ResponseEntity<Void> createBuildingRoute(@PathVariable("univId") Long univId,
													@RequestBody @Valid CreateBuildingRouteReqDTO createBuildingRouteReqDTO){
		mapService.createBuildingRoute(univId,createBuildingRouteReqDTO);
		return ResponseEntity.status(HttpStatus.CREATED).build();
	}

	@Override
	@GetMapping("/{univId}/routes/{versionId}")
	public ResponseEntity<GetChangedRoutesByRevisionResDTO> getChangedRoutesByRevision(@PathVariable("univId") Long univId,
																					   @PathVariable("versionId") Long versionId){
		GetChangedRoutesByRevisionResDTO getChangedRoutesByRevisionResDTO = adminService.getChangedRoutesByRevision(univId,versionId);
		return ResponseEntity.ok(getChangedRoutesByRevisionResDTO);
	}

}
