package com.softeer5.uniro_backend.route.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.softeer5.uniro_backend.route.dto.GetRiskRoutesResDTO;
import com.softeer5.uniro_backend.route.service.RouteService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
public class RouteController implements RouteApi {

	private final RouteService routeService;
	@Override
	@GetMapping("/{univId}/routes/risks")
	public ResponseEntity<GetRiskRoutesResDTO> getRiskRoutes(@PathVariable("univId") Long univId) {
		GetRiskRoutesResDTO riskRoutes = routeService.getRiskRoutes(univId);
		return ResponseEntity.ok().body(riskRoutes);
	}
}
