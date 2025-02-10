package com.softeer5.uniro_backend.route.controller;

import com.softeer5.uniro_backend.route.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.route.dto.response.FastestRouteResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetAllRoutesResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetRiskResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetRiskRoutesResDTO;
import com.softeer5.uniro_backend.route.dto.request.PostRiskReqDTO;
import com.softeer5.uniro_backend.route.service.RouteCalculationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.softeer5.uniro_backend.route.service.RouteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class RouteController implements RouteApi {

	private final RouteService routeService;
	private final RouteCalculationService routeCalculationService;

	@Override
	@GetMapping("/{univId}/routes")
	public ResponseEntity<GetAllRoutesResDTO> getAllRoutesAndNodes(@PathVariable("univId") Long univId){
		GetAllRoutesResDTO allRoutes = routeService.getAllRoutes(univId);
		return ResponseEntity.ok().body(allRoutes);
	}

	@Override
	@GetMapping("/{univId}/routes/risks")
	public ResponseEntity<GetRiskRoutesResDTO> getRiskRoutes(@PathVariable("univId") Long univId) {
		GetRiskRoutesResDTO riskRoutes = routeService.getRiskRoutes(univId);
		return ResponseEntity.ok().body(riskRoutes);
	}

	@Override
	@GetMapping("/{univId}/routes/{routeId}/risk")
	public ResponseEntity<GetRiskResDTO> getRisk(@PathVariable("univId") Long univId,
												 @PathVariable(value = "routeId") Long routeId){
		GetRiskResDTO riskResDTO = routeService.getRisk(univId, routeId);
		return ResponseEntity.ok().body(riskResDTO);
	}

	@Override
	@PostMapping("/{univId}/route/risk/{routeId}")
	public ResponseEntity<Void> updateRisk (@PathVariable("univId") Long univId,
									   @PathVariable("routeId") Long routeId,
									   @RequestBody @Valid PostRiskReqDTO postRiskReqDTO){
		routeService.updateRisk(univId,routeId,postRiskReqDTO);
		return ResponseEntity.ok().build();
	}

	@Override
	@PostMapping("/{univId}/route")
	public ResponseEntity<Void> createRoute (@PathVariable("univId") Long univId,
											 @RequestBody @Valid CreateRoutesReqDTO routes){
		routeCalculationService.createRoute(univId, routes);
		return ResponseEntity.status(HttpStatus.CREATED).build();
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
