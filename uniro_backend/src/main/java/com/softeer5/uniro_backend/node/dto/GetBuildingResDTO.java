package com.softeer5.uniro_backend.node.dto;

import java.util.Map;

import com.softeer5.uniro_backend.node.entity.Building;
import com.softeer5.uniro_backend.node.entity.Node;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(name = "GetBuildingResDTO", description = "건물 노드 조회 DTO")
@Getter
@RequiredArgsConstructor
public class GetBuildingResDTO {

	@Schema(description = "노드 id", example = "4")
	private final Long nodeId;

	@Schema(description = "건물 노드 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node;

	private final String buildingName;

	private final String buildingImageUrl;

	private final String phoneNumber;

	private final String address;

	public static GetBuildingResDTO of(Building building, Node node) {

		return new GetBuildingResDTO(node.getId(), node.getXY(), building.getName(), building.getImageUrl(),
			building.getPhoneNumber(), building.getAddress());
	}

}
