package com.softeer5.uniro_backend.node.dto;

import java.util.Map;

import com.softeer5.uniro_backend.node.entity.Building;
import com.softeer5.uniro_backend.node.entity.Node;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(name = "GetBuildingResDTO", description = "건물 노드 조회 DTO")
@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class GetBuildingResDTO {

	@Schema(description = "노드 ID", example = "4")
	private final Long nodeId;

	@Schema(description = "건물 노드 좌표 (위도 및 경도)",
		example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
	private final Map<String, Double> node;

	@Schema(description = "건물 이름", example = "공학관")
	private final String buildingName;

	@Schema(description = "건물 이미지 URL", example = "https://example.com/images/building.jpg")
	private final String buildingImageUrl;

	@Schema(description = "건물 전화번호",
		example = "02-123-4567")
	private final String phoneNumber;

	@Schema(description = "건물 주소",
		example = "서울특별시 강남구 테헤란로 123")
	private final String address;

	public static GetBuildingResDTO of(Building building, Node node) {

		return new GetBuildingResDTO(node.getId(), node.getXY(), building.getName(), building.getImageUrl(),
			building.getPhoneNumber(), building.getAddress());
	}

}
