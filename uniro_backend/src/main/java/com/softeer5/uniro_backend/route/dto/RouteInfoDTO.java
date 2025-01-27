package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.entity.CautionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import java.util.Map;
import java.util.Set;

@Getter
@Builder
public class RouteInfoDTO {
    @Schema(description = "위험요소가 있는 길의 ID", example = "2")
    private Long routeId;
    @Schema(description = "노드 1의 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
    private Map<String,Double> node1;
    @Schema(description = "노드 2의 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
    private Map<String,Double> node2;
    @Schema(description = "위험 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
    Set<CautionType> cautionFactors;

}
