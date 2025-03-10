package com.softeer5.uniro_backend.map.dto.response;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(name = "GetRiskRoutesResDTO", description = "위험&주의 요소 조회 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public class GetRiskRoutesResDTO {

	@Schema(description = "위험요소 객체")
	private final List<GetDangerResDTO> dangerRoutes;

	@Schema(description = "주의요소 객체")
	private final List<GetCautionResDTO> cautionRoutes;

	public static GetRiskRoutesResDTO of(List<GetDangerResDTO> dangerRoutes, List<GetCautionResDTO> cautionRoutes) {
		return new GetRiskRoutesResDTO(dangerRoutes, cautionRoutes);
	}
}
