package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.entity.CautionType;
import com.softeer5.uniro_backend.route.entity.Route;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.Set;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RouteInfoDTO {
    @Schema(description = "위험요소가 있는 길의 ID", example = "2")
    private final Long routeId;
    @Schema(description = "노드 1의 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
    private final Map<String,Double> node1;
    @Schema(description = "노드 2의 좌표", example = "{\"lag\": 127.123456, \"lat\": 37.123456}")
    private final Map<String,Double> node2;
    @Schema(description = "위험 요소 타입 리스트", example = "[\"SLOPE\", \"STAIRS\"]")
    private final Set<CautionType> cautionFactors;

    public static RouteInfoDTO of(Route route) {
        return new RouteInfoDTO(route.getId(),
                route.getNode1().getXY(),
                route.getNode2().getXY(),
                route.getCautionFactors());
    }
}
