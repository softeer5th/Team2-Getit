package com.softeer5.uniro_backend.map.controller;

import com.softeer5.uniro_backend.map.dto.request.CreateBuildingRouteReqDTO;
import com.softeer5.uniro_backend.map.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.map.dto.response.*;
import com.softeer5.uniro_backend.map.dto.request.PostRiskReqDTO;

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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@Tag(name = "간선 및 위험&주의 요소 관련 Api")
public interface MapApi {

	@Operation(summary = "모든 지도(노드,루트) 조회")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "모든 지도 조회 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<AllRoutesInfo> getAllRoutesAndNodes(@PathVariable("univId") Long univId);

	@Operation(summary = "모든 지도(노드,루트) 조회 by stream")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "모든 지도 조회 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<AllRoutesInfo> getAllRoutesAndNodesStream(@PathVariable("univId") Long univId);

	@Operation(summary = "모든 지도(노드,루트) 조회 by sse")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "모든 지도 조회 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	SseEmitter getAllRoutes(@PathVariable("univId") Long univId);

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
	ResponseEntity<AllRoutesInfo> createRoute (@PathVariable("univId") Long univId,
									  @RequestBody CreateRoutesReqDTO routes);

	@Operation(summary = "빠른 길 계산")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "빠른 길 계산 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<List<FastestRouteResDTO>> findFastestRoute(@PathVariable("univId") Long univId,
															  @RequestParam Long startNodeId,
															  @RequestParam Long endNodeId);


	@Operation(summary = "빌딩 노드와 연결된 길 생성")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "빌딩 노드와 연결된 길 생성 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<Void> createBuildingRoute(@PathVariable("univId") Long univId,
													@RequestBody @Valid CreateBuildingRouteReqDTO createBuildingRouteReqDTO);

	@Operation(summary = "현재 버전과 특정 버전의 차이점 조회")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "현재 버전과 특정 버전의 차이점 조회 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<GetChangedRoutesByRevisionResDTO> getChangedRoutesByRevision(@PathVariable("univId") Long univId,
																				@PathVariable("versionId") Long versionId);
}
