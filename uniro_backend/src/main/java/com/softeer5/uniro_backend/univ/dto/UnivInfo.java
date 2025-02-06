package com.softeer5.uniro_backend.univ.dto;

import com.querydsl.core.annotations.QueryProjection;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(name = "UnivInfo", description = "대학 정보 DTO")
public class UnivInfo {

    @Schema(description = "대학교 id", example = "11")
    private final Long id;

    @Schema(description = "대학교 이름", example = "한양대학교")
    private final String name;

    @Schema(description = "대학교 로고 이미지 url", example = "www.image.com")
    private final String imageUrl;

    @QueryProjection
    public UnivInfo(Long id, String name, String imageUrl) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
    }

}
