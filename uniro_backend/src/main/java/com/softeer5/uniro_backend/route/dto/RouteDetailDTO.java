package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.entity.DirectionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RouteDetailDTO {
    @Schema(description = "다음 이정표까지의 거리", example = "17.38721484")
    private double dist;
    @Schema(description = "좌회전, 우회전, 위험요소 등 정보", example = "RIGHT")
    private DirectionType directionType;
}
