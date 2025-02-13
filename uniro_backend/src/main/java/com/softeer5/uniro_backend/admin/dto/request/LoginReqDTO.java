package com.softeer5.uniro_backend.admin.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Schema(name = "LoginReqDTO", description = "로그인 요청 DTO")
public class LoginReqDTO {
	@Schema(description = "대학교 id", example = "1001")
	@NotNull
	private final Long univId;

	@Schema(description = "인증 코드", example = "abcd123")
	@NotNull
	private final String code;
}
