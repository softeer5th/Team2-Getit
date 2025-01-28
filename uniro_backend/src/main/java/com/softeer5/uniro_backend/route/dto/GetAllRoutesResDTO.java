package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.entity.CoreRoute;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Schema(name = "GetAllRoutesResDTO", description = "모든 노드,루트 조회 DTO")
public class GetAllRoutesResDTO {
    private final Long coreRouteId;
    private final Long node1Id;
    private final Long node2Id;
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
