package com.softeer5.uniro_backend.map.controller;

import com.softeer5.uniro_backend.map.dto.request.CreateBuildingRouteReqDTO;
import com.softeer5.uniro_backend.map.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.map.dto.response.FastestRouteResDTO;
import com.softeer5.uniro_backend.map.dto.response.GetAllRoutesResDTO;
import com.softeer5.uniro_backend.map.dto.response.GetRiskResDTO;
import com.softeer5.uniro_backend.map.dto.response.GetRiskRoutesResDTO;
import com.softeer5.uniro_backend.map.dto.request.PostRiskReqDTO;
import com.softeer5.uniro_backend.map.service.RouteCalculator;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.softeer5.uniro_backend.map.service.MapService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class MapController implements MapApi {

	private final MapService mapService;
	private final RouteCalculator routeCalculator;

	@Override
	@GetMapping("/{univId}/routes")
	public ResponseEntity<GetAllRoutesResDTO> getAllRoutesAndNodes(@PathVariable("univId") Long univId){
		GetAllRoutesResDTO allRoutes = mapService.getAllRoutes(univId);
		return ResponseEntity.ok().body(allRoutes);
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
	public ResponseEntity<Void> createRoute (@PathVariable("univId") Long univId,
											 @RequestBody @Valid CreateRoutesReqDTO routes){
		mapService.createRoute(univId, routes);
		return ResponseEntity.status(HttpStatus.CREATED).build();
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

}
