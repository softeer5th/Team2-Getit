package com.softeer5.uniro_backend.admin.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@Schema(name = "ChangedRouteDTO", description = "위험요소, 주의요소, cost가 변경된 길의 현재&과거 정보 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class ChangedRouteDTO {
    @Schema(description = "route ID", example = "17")
    private final Long routeId;
    @Schema(description = "현재", example = "")
    private final RouteDifferInfo current;
    @Schema(description = "해당 버전 (과거)", example = "")
    private final RouteDifferInfo difference;

    public static ChangedRouteDTO of(Long id, RouteDifferInfo current, RouteDifferInfo difference) {
        return new ChangedRouteDTO(id, current, difference);
    }
}