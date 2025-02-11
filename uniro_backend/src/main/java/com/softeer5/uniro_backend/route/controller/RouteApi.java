package com.softeer5.uniro_backend.route.controller;

import com.softeer5.uniro_backend.route.dto.request.CreateBuildingRouteReqDTO;
import com.softeer5.uniro_backend.route.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.route.dto.response.FastestRouteResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetAllRoutesResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetRiskResDTO;
import com.softeer5.uniro_backend.route.dto.response.GetRiskRoutesResDTO;
import com.softeer5.uniro_backend.route.dto.request.PostRiskReqDTO;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "간선 및 위험&주의 요소 관련 Api")
public interface RouteApi {

	@Operation(summary = "모든 지도(노드,루트) 조회")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "모든 지도 조회 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<GetAllRoutesResDTO> getAllRoutesAndNodes(@PathVariable("univId") Long univId);

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
	ResponseEntity<GetRiskResDTO> getRisk(
		@PathVariable("univId") Long univId,
		@PathVariable("routeId") Long routeId);

	@Operation(summary = "위험&주의 요소 제보")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "단일 route의 위험&주의 요소 제보 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<Void> updateRisk(@PathVariable("univId") Long univId,
								  @PathVariable("routeId") Long routeId,
								  @RequestBody PostRiskReqDTO postRiskReqDTO);

	@Operation(summary = "새로운 길 추가")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "201", description = "길 추가 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<Void> createRoute (@PathVariable("univId") Long univId,
									  @RequestBody CreateRoutesReqDTO routes);

	@Operation(summary = "빠른 길 계산")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "빠른 길 계산 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<FastestRouteResDTO> calculateFastestRoute(@PathVariable("univId") Long univId,
																	@RequestParam Long startNodeId,
																	@RequestParam Long endNodeId);


	@Operation(summary = "빌딩 노드와 연결된 길 생성")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "빌딩 노드와 연결된 길 생성 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<Void> createBuildingRoute(@PathVariable("univId") Long univId,
													@RequestBody @Valid CreateBuildingRouteReqDTO createBuildingRouteReqDTO);
}
