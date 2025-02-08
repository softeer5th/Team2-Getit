package com.softeer5.uniro_backend.route.dto.response;

import com.softeer5.uniro_backend.route.entity.CautionFactor;
import com.softeer5.uniro_backend.route.entity.DangerType;
import com.softeer5.uniro_backend.route.entity.Route;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Schema(name = "GetRiskResDTO", description = "특정 간선의 주의/위험요소 조회 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class GetRiskResDTO {
    @Schema(description = "route ID", example = "3")
    private final Long routeId;
    @Schema(description = "위험 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
    private final List<CautionFactor> cautionFactors;
    @Schema(description = "위험 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
    private final List<DangerType> dangerTypes;

    public static GetRiskResDTO of(Route route) {
        return new GetRiskResDTO(route.getId(),route.getCautionFactorsByList(), route.getDangerFactorsByList());
    }

}
