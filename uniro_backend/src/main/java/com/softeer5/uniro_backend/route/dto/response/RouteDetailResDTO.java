package com.softeer5.uniro_backend.route.dto.response;

import com.softeer5.uniro_backend.route.entity.DirectionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Schema(name = "RouteDetailResDTO", description = "상세 경로 DTO")
public class RouteDetailResDTO {
    @Schema(description = "다음 이정표까지의 거리", example = "17.38721484")
    private final double dist;
    @Schema(description = "좌회전, 우회전, 위험요소 등 정보", example = "RIGHT")
    private final DirectionType directionType;
    @Schema(description = "상세 경로의 좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
    private final Map<String, Double> coordinates;

    public static RouteDetailResDTO of(double dist, DirectionType directionType, Map<String, Double> coordinates) {
        return new RouteDetailResDTO(dist, directionType, coordinates);
    }
}
