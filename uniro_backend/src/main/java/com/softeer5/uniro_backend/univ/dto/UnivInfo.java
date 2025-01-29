package com.softeer5.uniro_backend.univ.dto;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Getter;

@Getter
public class UnivInfo {
    private Long id;
    private String name;
    private String imageUrl;

    @QueryProjection
    public UnivInfo(Long id, String name, String imageUrl) {
        this.id = id;
        this.name = name;
        this.imageUrl = imageUrl;
    }

}
