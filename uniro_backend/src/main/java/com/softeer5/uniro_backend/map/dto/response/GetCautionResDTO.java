package com.softeer5.uniro_backend.map.dto.response;

import java.util.List;
import java.util.Map;

import com.softeer5.uniro_backend.map.enums.CautionFactor;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Schema(name = "GetCautionResDTO", description = "위험 요소 조회 DTO")
public class GetCautionResDTO {

	@Schema(description = "노드 1의 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node1;

	@Schema(description = "노드 2의 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node2;

	@Schema(description = "간선 id", example = "3")
	private final Long routeId;

	@Schema(description = "위험 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
	private final List<CautionFactor> cautionFactors;

	public static GetCautionResDTO of(Map<String, Double> node1, Map<String, Double> node2, Long routeId, List<CautionFactor> cautionFactors){
		return new GetCautionResDTO(node1, node2, routeId, cautionFactors);
	}
}
