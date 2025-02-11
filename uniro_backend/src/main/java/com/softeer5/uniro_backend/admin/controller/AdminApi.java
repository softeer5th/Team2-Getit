package com.softeer5.uniro_backend.admin.controller;

import com.softeer5.uniro_backend.admin.dto.RevInfoDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Tag(name = "admin 페이지 API")
public interface AdminApi {

    @Operation(summary = "모든 버전정보 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "모든 버전정보 조회 성공"),
            @ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
    })
    ResponseEntity<List<RevInfoDTO>> getAllRev(@PathVariable("univId") Long univId);

    @Operation(summary = "특정 버전으로 롤백")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "특정 버전으로 롤백 성공"),
        @ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
    })
    ResponseEntity<Void> rollbackRev(
		@PathVariable("univId") Long univId,
		@PathVariable("versionId") Long versionId);
}
