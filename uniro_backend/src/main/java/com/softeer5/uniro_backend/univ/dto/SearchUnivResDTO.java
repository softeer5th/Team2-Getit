package com.softeer5.uniro_backend.univ.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Schema(name = "SearchUnivResDTO", description = "대학 검색 DTO")
public class SearchUnivResDTO {

    @Schema(description = "실제 data", example = "")
    private final List<UnivInfo> data;

    public static SearchUnivResDTO of(List<UnivInfo> univInfos) {
        return new SearchUnivResDTO(univInfos);
    }
}
