package com.softeer5.uniro_backend.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.softeer5.uniro_backend.admin.dto.request.LoginReqDTO;
import com.softeer5.uniro_backend.admin.dto.response.LoginResDTO;
import com.softeer5.uniro_backend.admin.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuthController implements AuthApi {
	private final AuthService authService;
	@Override
	@PostMapping("/admin/auth/login")
	public ResponseEntity<LoginResDTO> login(@RequestBody @Valid LoginReqDTO loginReqDTO) {
		LoginResDTO loginResDTO = authService.login(loginReqDTO);
		return ResponseEntity.ok(loginResDTO);
	}
}
