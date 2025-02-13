package com.softeer5.uniro_backend.admin.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@Schema(name = "LoginResDTO", description = "로그인 응답 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class LoginResDTO {
	private final String accessToken;

	public static LoginResDTO of(String accessToken) {
		return new LoginResDTO(accessToken);
	}
}
