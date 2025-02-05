package com.softeer5.uniro_backend.route.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(name = "CoreRouteResDTO", description = "코어 루트 정보 DTO")
public class CreateRouteServiceReqDTO {

	@Schema(description = "x 좌표", example = "127.123456")
	private final double lng;

	@Schema(description = "y 좌표", example = "37.123456")
	private final double lat;
}
