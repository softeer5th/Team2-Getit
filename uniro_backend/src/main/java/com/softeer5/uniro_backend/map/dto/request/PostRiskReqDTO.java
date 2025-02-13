package com.softeer5.uniro_backend.map.dto.request;

import com.softeer5.uniro_backend.map.enums.CautionFactor;
import com.softeer5.uniro_backend.map.enums.DangerFactor;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
@Schema(name = "PostRiskReqDTO", description = "위험 간선 제보 DTO")
public class PostRiskReqDTO {

    @Schema(description = "주의 요소 목록", example = "[\"SLOPE\", \"CURB\"]")
    @NotNull
    private List<CautionFactor> cautionFactors;

    @Schema(description = "위험 요소 목록", example = "[\"CURB\", \"STAIRS\"]")
    @NotNull
    private List<DangerFactor> dangerFactors;
}
