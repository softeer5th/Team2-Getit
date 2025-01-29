package com.softeer5.uniro_backend.univ.controller;

import com.softeer5.uniro_backend.univ.dto.SearchUnivResDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "대학교 관련 Api")
public interface UnivAPI {

    @Operation(summary = "대학 이름 검색")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "대학 이름 검색 성공"),
            @ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
    })
    ResponseEntity<SearchUnivResDTO> searchUniv(
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "cursor-id", required = false) Long cursorId,
            @RequestParam(value = "page-size", required = false) Integer pageSize
    );

}
