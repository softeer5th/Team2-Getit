package com.softeer5.uniro_backend.route.dto;

import java.util.List;
import java.util.Map;

import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.route.entity.CautionType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Schema(name = "GetDangerResDTO", description = "위험 요소 조회 DTO")
public class GetCautionResDTO {

	@Schema(description = "노드 1의 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node1;

	@Schema(description = "노드 2의 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node2;

	@Schema(description = "간선 id", example = "3")
	private final Long routeId;

	@Schema(description = "위험 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
	private final List<CautionType> cautionTypes;

	public static GetCautionResDTO of(Node node1, Node node2, Long routeId, List<CautionType> cautionTypes){
		return new GetCautionResDTO(node1.getXY(), node2.getXY(), routeId, cautionTypes);
	}
}
