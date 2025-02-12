package com.softeer5.uniro_backend.map.dto.response;

import com.softeer5.uniro_backend.map.entity.CautionFactor;
import com.softeer5.uniro_backend.map.entity.DirectionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;
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
    @Schema(description = "주의 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
    private final List<CautionFactor> cautionFactors;

    public static RouteDetailResDTO of(double dist, DirectionType directionType,
                                       Map<String, Double> coordinates,
                                       List<CautionFactor> cautionFactors) {
        return new RouteDetailResDTO(dist, directionType, coordinates, cautionFactors);
    }
}
