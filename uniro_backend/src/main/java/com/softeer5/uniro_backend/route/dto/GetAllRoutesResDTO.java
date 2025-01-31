package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.entity.CoreRoute;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Schema(name = "GetAllRoutesResDTO", description = "모든 노드,루트 조회 DTO")
public class GetAllRoutesResDTO {
    @Schema(description = "코어루트(코어노드-코어노드) id", example = "1")
    private final Long coreRouteId;
    @Schema(description = "node1(코어노드) id", example = "3")
    private final Long node1Id;
    @Schema(description = "node2(코어노드) id", example = "4")
    private final Long node2Id;
    @Schema(description = "길을 이루는 좌표목록", example = "")
    private final List<Map<String, Double>> routes;

    private GetAllRoutesResDTO(Long coreRouteId, Long node1Id, Long node2Id, List<Map<String, Double>> routes){
        this.coreRouteId = coreRouteId;
        this.node1Id = node1Id;
        this.node2Id = node2Id;
        this.routes = routes;
    }

    public static GetAllRoutesResDTO of(CoreRoute coreRoute){
        return new GetAllRoutesResDTO(coreRoute.getId(), coreRoute.getNode1Id(), coreRoute.getNode2Id(), coreRoute.getPathAsList());
    }
}
