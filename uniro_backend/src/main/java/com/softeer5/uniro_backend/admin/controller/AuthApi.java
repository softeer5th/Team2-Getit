package com.softeer5.uniro_backend.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import com.softeer5.uniro_backend.admin.dto.request.LoginReqDTO;
import com.softeer5.uniro_backend.admin.dto.response.LoginResDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "admin 로그인 페이지 API")
public interface AuthApi {
	@Operation(summary = "로그인")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200", description = "로그인 성공"),
		@ApiResponse(responseCode = "400", description = "EXCEPTION(임시)", content = @Content),
	})
	ResponseEntity<LoginResDTO> login(@RequestBody @Valid LoginReqDTO loginReqDTO);
}
