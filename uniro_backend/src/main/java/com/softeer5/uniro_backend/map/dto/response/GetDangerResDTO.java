package com.softeer5.uniro_backend.map.dto.response;

import java.util.List;
import java.util.Map;

import com.softeer5.uniro_backend.map.entity.DangerFactor;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(name = "GetDangerResDTO", description = "위험 요소 조회 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
public class GetDangerResDTO {

	@Schema(description = "노드 1의 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node1;

	@Schema(description = "노드 2의 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node2;

	@Schema(description = "간선 id", example = "3")
	private final Long routeId;

	@Schema(description = "위험 요소 타입 리스트", example = "[\"CURB\", \"STAIRS\"]")
	private final List<DangerFactor> dangerFactors;

	public static GetDangerResDTO of(Map<String, Double> node1, Map<String, Double> node2, Long routeId, List<DangerFactor> dangerFactors){
		return new GetDangerResDTO(node1, node2, routeId, dangerFactors);
	}

	public List<DangerFactor> getDangerFactors() {
		return dangerFactors;
	}
}
