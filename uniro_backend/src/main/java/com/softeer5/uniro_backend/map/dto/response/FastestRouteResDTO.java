package com.softeer5.uniro_backend.map.dto.response;

import com.softeer5.uniro_backend.map.entity.RoadExclusionPolicy;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Schema(name = "FastestRouteResDTO", description = "빠른 경로 조회 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class FastestRouteResDTO {
    @Schema(description = "길찾기 타입 (PEDES-도보, WHEEL_FAST-휠체어빠른, WHEEL_SAFE-휠체어안전)", example = "PEDES")
    private final RoadExclusionPolicy routeType;
    @Schema(description = "길 찾기 결과에 위험요소가 포함되어있는지 여부", example = "true")
    private final boolean hasCaution;
    @Schema(description = "총 이동거리", example = "150.3421234")
    private final double totalDistance;
    @Schema(description = "총 걸리는 시간(초) - 도보", example = "1050.32198432")
    private final Double pedestrianTotalCost;
    @Schema(description = "총 걸리는 시간(초) - 수동휠체어", example = "2253.51234432")
    private final Double manualTotalCost;
    @Schema(description = "총 걸리는 시간(초) - 전동휠체어", example = "935.3125632")
    private final Double electricTotalCost;
    @Schema(description = "길 찾기 결과에 포함된 모든 길", example = "")
    private final List<RouteInfoResDTO> routes;
    @Schema(description = "상세안내 관련 정보", example = "")
    private final List<RouteDetailResDTO> routeDetails;

    public static FastestRouteResDTO of(RoadExclusionPolicy routeType,
                                        boolean hasCaution,
                                        double totalDistance,
                                        Double pedestrianTotalCost,
                                        Double manualTotalCost,
                                        Double electricTotalCost,
                                        List<RouteInfoResDTO> routes,
                                        List<RouteDetailResDTO> routeDetails) {
        return new FastestRouteResDTO(routeType,
                hasCaution,
                totalDistance,
                pedestrianTotalCost,
                manualTotalCost,
                electricTotalCost,
                routes,
                routeDetails);
    }
}
