package com.softeer5.uniro_backend.building.dto.response;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Schema(name = "SearchBuildingResDTO", description = "건물 노드 검색 DTO")
@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class SearchBuildingResDTO {

	@Schema(description = "실제 data", example = "")
	private final List<GetBuildingResDTO> data;

	public static SearchBuildingResDTO of(List<GetBuildingResDTO> resDTOS) {
		return new SearchBuildingResDTO(resDTOS);
	}
}
