package com.softeer5.uniro_backend.route.controller;

import com.softeer5.uniro_backend.route.dto.ShortestRouteResDTO;
import com.softeer5.uniro_backend.route.service.RouteCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/map")
public class MapController {
    private final RouteCalculationService routeCalculationService;

    @GetMapping("/route")
    public ResponseEntity<ShortestRouteResDTO> calculateFastestRoute(@RequestParam Long startNodeId,
                                                                     @RequestParam Long endNodeId) {
        ShortestRouteResDTO shortestRouteResDTO = routeCalculationService.calculateFastestRoute(startNodeId, endNodeId);
        return ResponseEntity.ok(shortestRouteResDTO);
    }
}
