package com.softeer5.uniro_backend.route.dto.request;

import com.softeer5.uniro_backend.route.entity.CautionType;
import com.softeer5.uniro_backend.route.entity.DangerType;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@RequiredArgsConstructor
@Schema(name = "PostRiskReqDTO", description = "위험 간선 제보 DTO")
public class PostRiskReqDTO {

    @Schema(description = "주의 요소 목록", example = "[\"SLOPE\", \"CURB\"]")
    private List<CautionType> cautionTypes;

    @Schema(description = "위험 요소 목록", example = "[\"CURB\", \"STAIRS\"]")
    private List<DangerType> dangerTypes;
}
