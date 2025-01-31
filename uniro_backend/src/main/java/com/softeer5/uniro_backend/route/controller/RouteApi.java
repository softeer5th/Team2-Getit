package com.softeer5.uniro_backend.route.controller;

import com.softeer5.uniro_backend.route.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "간선 및 위험&주의 요소 관련 Api")
public interface RouteApi {

	@Operation(summary = "모든 지도(노드,루트) 조회")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "모든 지도 조회 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	public ResponseEntity<List<GetAllRoutesResDTO>> getAllRoutesAndNodes(@PathVariable("univId") Long univId);

	@Operation(summary = "위험&주의 요소 조회")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "위험&주의 요소 조회 성공"),
		@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<GetRiskRoutesResDTO> getRiskRoutes(@PathVariable("univId") Long univId);

	@Operation(summary = "단일 route의 위험&주의 요소 조회")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "단일 route의 위험&주의 요소 조회 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<GetRiskResDTO> getRisk(@PathVariable("univId") Long univId,
												 @RequestParam(value = "start-lat") double startLat,
												 @RequestParam(value = "start-lng") double startLng,
												 @RequestParam(value = "end-lat") double endLat,
												 @RequestParam(value = "end-lng") double endLng);

	@Operation(summary = "위험&주의 요소 제보")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "단일 route의 위험&주의 요소 제보 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<Void> updateRisk(@PathVariable("univId") Long univId,
								  @PathVariable("routeId") Long routeId,
								  @RequestBody PostRiskReqDTO postRiskReqDTO);

	@Operation(summary = "빠른 길 계산")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "빠른 길 계산 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<FastestRouteResDTO> calculateFastestRoute(@PathVariable("univId") Long univId,
																	@RequestParam Long startNodeId,
																	@RequestParam Long endNodeId);
}
