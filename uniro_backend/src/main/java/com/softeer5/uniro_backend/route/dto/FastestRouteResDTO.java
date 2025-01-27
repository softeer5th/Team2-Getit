package com.softeer5.uniro_backend.route.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@Schema(name = "GetDangerResDTO", description = "위험 요소 조회 DTO")
public class FastestRouteResDTO {
    @Schema(description = "길 찾기 결과에 위험요소가 포함되어있는지 여부", example = "true")
    private boolean hasCaution;
    @Schema(description = "총 이동거리", example = "150.3421234")
    private double totalDistance;
    @Schema(description = "총 걸리는 시간(초)", example = "1050.32198432")
    private double totalCost;
    @Schema(description = "길 찾기 결과에 포함된 모든 길", example = "")
    private List<RouteInfoDTO> routes;
    @Schema(description = "상세안내 관련 정보", example = "")
    private List<RouteDetailDTO> routeDetails;
}
