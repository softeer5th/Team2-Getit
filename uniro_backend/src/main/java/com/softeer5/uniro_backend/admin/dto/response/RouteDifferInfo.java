package com.softeer5.uniro_backend.admin.dto.response;

import com.softeer5.uniro_backend.map.enums.CautionFactor;
import com.softeer5.uniro_backend.map.enums.DangerFactor;
import com.softeer5.uniro_backend.map.entity.Route;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Schema(name = "RouteDifferInfo", description = "cost, 위험요소, 주의요소 정보 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RouteDifferInfo {
    @Schema(description = "주의요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
    private final List<CautionFactor> cautionFactors;
    @Schema(description = "위험 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
    private final List<DangerFactor> dangerFactors;
    @Schema(description = "가중치", example = "3.021742")
    private final double cost;

    public static RouteDifferInfo of(Route route) {
        return new RouteDifferInfo(route.getCautionFactorsByList(), route.getDangerFactorsByList(), route.getDistance());
    }
}
