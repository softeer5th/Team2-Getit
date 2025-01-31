package com.softeer5.uniro_backend.route.controller;

import com.softeer5.uniro_backend.route.dto.*;
import com.softeer5.uniro_backend.route.service.RouteCalculationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.softeer5.uniro_backend.route.service.RouteService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class RouteController implements RouteApi {

	private final RouteService routeService;
	private final RouteCalculationService routeCalculationService;

	@Override
	@GetMapping("/{univId}/routes")
	public ResponseEntity<List<GetAllRoutesResDTO>> getAllRoutesAndNodes(@PathVariable("univId") Long univId){
		List<GetAllRoutesResDTO> allRoutes = routeService.getAllRoutes(univId);
		return ResponseEntity.ok().body(allRoutes);
	}

	@Override
	@GetMapping("/{univId}/routes/risks")
	public ResponseEntity<GetRiskRoutesResDTO> getRiskRoutes(@PathVariable("univId") Long univId) {
		GetRiskRoutesResDTO riskRoutes = routeService.getRiskRoutes(univId);
		return ResponseEntity.ok().body(riskRoutes);
	}

	@Override
	@GetMapping("/{univId}/route/risk")
	public ResponseEntity<GetRiskResDTO> getRisk(@PathVariable("univId") Long univId,
												 @RequestParam(value = "start-lat") double startLat,
												 @RequestParam(value = "start-lng") double startLng,
												 @RequestParam(value = "end-lat") double endLat,
												 @RequestParam(value = "end-lng") double endLng){
		GetRiskResDTO riskResDTO = routeService.getRisk(univId,startLat,startLng,endLat,endLng);
		return ResponseEntity.ok().body(riskResDTO);
	}

	@Override
	@PostMapping("/{univId}/route/risk/{routeId}")
	public ResponseEntity<Void> updateRisk (@PathVariable("univId") Long univId,
									   @PathVariable("routeId") Long routeId,
									   @RequestBody PostRiskReqDTO postRiskReqDTO){
		routeService.updateRisk(univId,routeId,postRiskReqDTO);
		return ResponseEntity.ok().build();
	}

	@Override
	@GetMapping("/{univId}/routes/fastest")
	public ResponseEntity<FastestRouteResDTO> calculateFastestRoute(@PathVariable("univId") Long univId,
																	@RequestParam(value = "start-node-id") Long startNodeId,
																	@RequestParam(value = "end-node-id") Long endNodeId) {
		FastestRouteResDTO fastestRouteResDTO = routeCalculationService.calculateFastestRoute(univId, startNodeId, endNodeId);
		return ResponseEntity.ok(fastestRouteResDTO);
	}
}
