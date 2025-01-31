package com.softeer5.uniro_backend.node.dto;

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

	@Schema(description = "다음 페이지 요청을 위한 커서 ID (마지막 데이터의 ID)", example = "103")
	private final Long nextCursor;

	@Schema(description = "다음 페이지가 존재하는지 여부", example = "true")
	private final boolean hasNext;

	public static SearchBuildingResDTO of(List<GetBuildingResDTO> resDTOS, Long nextCursor, boolean hasNext) {
		return new SearchBuildingResDTO(resDTOS, nextCursor, hasNext);
	}
}
