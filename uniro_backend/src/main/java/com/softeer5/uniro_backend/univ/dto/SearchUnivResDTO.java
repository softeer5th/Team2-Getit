package com.softeer5.uniro_backend.univ.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Schema(name = "SearchUnivResDTO", description = "대학 검색 DTO")
@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class SearchUnivResDTO {

    @Schema(description = "실제 data", example = "")
    private final List<UnivInfo> data;

    @Schema(description = "다음 페이지 요청을 위한 커서 ID (마지막 데이터의 ID)", example = "103")
    private final Long nextCursor;

    @Schema(description = "다음 페이지가 존재하는지 여부", example = "true")
    private final boolean hasNext;

    public static SearchUnivResDTO of(List<UnivInfo> univInfos, Long nextCursor, boolean hasNext) {
        return new SearchUnivResDTO(univInfos,nextCursor,hasNext);
    }
}
