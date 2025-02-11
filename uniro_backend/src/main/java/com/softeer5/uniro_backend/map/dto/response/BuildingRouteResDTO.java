package com.softeer5.uniro_backend.map.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Schema(name = "BuildingRouteResDTO", description = "빌딩 루트 정보 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class BuildingRouteResDTO {

    @Schema(description = "코어 노드 1", example = "32")
    private final Long coreNode1Id;

    @Schema(description = "코어 노드 2", example = "13")
    private final Long coreNode2Id;

    @Schema(description = "간선 정보", example = "")
    private final List<RouteCoordinatesInfoResDTO> routes;

    public static BuildingRouteResDTO of(Long startNode, Long endNode, List<RouteCoordinatesInfoResDTO> routes){
        return new BuildingRouteResDTO(startNode, endNode, routes);
    }
}
