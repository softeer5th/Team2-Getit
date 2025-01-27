package com.softeer5.uniro_backend.route.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import com.softeer5.uniro_backend.route.dto.GetRiskRoutesResDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "간선 및 위험&주의 요소 관련 Api")
public interface RouteApi {
	@Operation(summary = "위험&주의 요소 조회")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "위험&주의 요소 조회 성공"),
		@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<GetRiskRoutesResDTO> getRiskRoutes(@PathVariable("univId") Long univId);
}
