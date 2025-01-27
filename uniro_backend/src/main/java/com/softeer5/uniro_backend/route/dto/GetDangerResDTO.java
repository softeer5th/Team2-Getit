package com.softeer5.uniro_backend.route.dto;

import java.util.List;
import java.util.Map;

import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.route.entity.DangerType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(name = "GetDangerResDTO", description = "위험 요소 조회 DTO")
@RequiredArgsConstructor
@Getter
public class GetDangerResDTO {

	@Schema(description = "노드 1의 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node1;

	@Schema(description = "노드 2의 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node2;

	@Schema(description = "간선 id", example = "3")
	private final Long routeId;

	@Schema(description = "위험 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
	private final List<DangerType> dangerTypes;

	public static GetDangerResDTO of(Node node1, Node node2, Long routeId, List<DangerType> dangerTypes){
		return new GetDangerResDTO(node1.getXY(), node2.getXY(), routeId, dangerTypes);
	}
}
