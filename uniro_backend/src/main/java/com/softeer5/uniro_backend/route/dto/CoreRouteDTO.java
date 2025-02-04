package com.softeer5.uniro_backend.route.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class CoreRouteDTO {
    private final Long coreNode1Id;
    private final Long cordNode2Id;
    private final List<RouteCoordinatesInfo> routes;

    private CoreRouteDTO(Long coreNode1Id, Long cordNode2Id, List<RouteCoordinatesInfo> routes){
        this.coreNode1Id = coreNode1Id;
        this.cordNode2Id = cordNode2Id;
        this.routes = routes;
    }

    public static CoreRouteDTO of(Long startNode, Long endNode, List<RouteCoordinatesInfo> routes){
        return new CoreRouteDTO(startNode, endNode, routes);
    }
}
