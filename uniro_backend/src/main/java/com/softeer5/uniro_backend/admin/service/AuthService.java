package com.softeer5.uniro_backend.admin.service;

import static com.softeer5.uniro_backend.common.error.ErrorCode.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.admin.dto.request.LoginReqDTO;
import com.softeer5.uniro_backend.admin.dto.response.LoginResDTO;
import com.softeer5.uniro_backend.admin.entity.Admin;
import com.softeer5.uniro_backend.admin.jwt.JwtTokenProvider;
import com.softeer5.uniro_backend.admin.repository.AdminRepository;
import com.softeer5.uniro_backend.common.exception.custom.AdminException;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthService {

	private final AdminRepository adminRepository;
	private final JwtTokenProvider jwtTokenProvider;

	public LoginResDTO login(LoginReqDTO loginReqDTO) {

		Admin admin = adminRepository.findByUnivId(loginReqDTO.getUnivId())
			.orElseThrow(() -> new AdminException("invalid univ id", INVALID_UNIV_ID));

		if (!admin.getCode().equals(loginReqDTO.getCode())) {
			throw new AdminException("invalid code", INVALID_ADMIN_CODE);
		}

		return LoginResDTO.of(jwtTokenProvider.createToken(admin.getUnivId()));
	}
}
