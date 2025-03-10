package com.softeer5.uniro_backend.building.controller;

import java.util.List;

import com.softeer5.uniro_backend.building.dto.request.CreateBuildingNodeReqDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.softeer5.uniro_backend.building.dto.response.GetBuildingResDTO;
import com.softeer5.uniro_backend.building.dto.response.SearchBuildingResDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "노드(코어노드, 서브노드, 건물노드) 관련 Api")
public interface BuildingApi {
	@Operation(summary = "건물 노드 조회")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "건물 노드 조회 성공"),
		@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<List<GetBuildingResDTO>> getBuildings(
		@PathVariable("univId") Long univId,
		@RequestParam(value = "level", required = false, defaultValue = "1") int level,
		@RequestParam(value = "left-up-lat") double leftUpLat,
		@RequestParam(value = "left-up-lng") double leftUpLng,
		@RequestParam(value = "right-down-lat") double rightDownLat,
		@RequestParam(value = "right-down-lng") double rightDownLng
	);

	@Operation(summary = "건물 노드 검색")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "건물 노드 검색 성공"),
		@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<SearchBuildingResDTO> searchBuildings(
		@PathVariable("univId") Long univId,
		@RequestParam(value = "name", required = false) String name,
		@RequestParam(value = "page-size", required = false) Integer pageSize
	);

	@Operation(summary = "상세 건물 노드 조회")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "상세 건물 노드 조회 성공"),
		@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<GetBuildingResDTO> getBuilding(
		@PathVariable("univId") Long univId,
		@PathVariable("nodeId") Long nodeId
	);

	@Operation(summary = "건물 노드 생성")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "건물 노드 생성 성공"),
			@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<Void> createBuildingNode(@PathVariable("univId") Long univId,
											@RequestBody CreateBuildingNodeReqDTO createBuildingNodeReqDTO);

}
