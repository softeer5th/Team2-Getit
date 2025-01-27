package com.softeer5.uniro_backend.route.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(name = "GetRiskRoutesResDTO", description = "위험&주의 요소 조회 DTO")
@RequiredArgsConstructor
@Getter
public class GetRiskRoutesResDTO {

	@Schema(description = "위험요소 객체", example = "")
	private final List<GetDangerResDTO> dangerRoutes;

	@Schema(description = "주의요소 객체", example = "")
	private final List<GetCautionResDTO> cautionRoutes;

	public static GetRiskRoutesResDTO of(List<GetDangerResDTO> dangerRoutes, List<GetCautionResDTO> cautionRoutes) {
		return new GetRiskRoutesResDTO(dangerRoutes, cautionRoutes);
	}
}
