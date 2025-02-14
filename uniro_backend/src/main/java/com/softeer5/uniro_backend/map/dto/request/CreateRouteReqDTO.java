package com.softeer5.uniro_backend.map.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(name = "CreateRouteReqDTO", description = "길 생성 단일 노드 정보 DTO")
public class CreateRouteReqDTO {

	@Schema(description = "x 좌표", example = "127.123456")
	private final double lng;

	@Schema(description = "y 좌표", example = "37.123456")
	private final double lat;
}
