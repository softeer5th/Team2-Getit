package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.entity.DirectionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RouteDetailDTO {
    @Schema(description = "다음 이정표까지의 거리", example = "17.38721484")
    private final double dist;
    @Schema(description = "좌회전, 우회전, 위험요소 등 정보", example = "RIGHT")
    private final DirectionType directionType;

    public static RouteDetailDTO of(double dist, DirectionType directionType) {
        return new RouteDetailDTO(dist, directionType);
    }
}
