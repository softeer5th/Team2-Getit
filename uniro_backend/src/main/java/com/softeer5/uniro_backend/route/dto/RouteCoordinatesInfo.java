package com.softeer5.uniro_backend.route.dto;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RouteCoordinatesInfo {
    private final Long routeId;
    private final Long startNodeId;
    private final Map<String, Double> startNode;
    private final Long endNodeId;
    private final Map<String, Double> endNode;

    public static RouteCoordinatesInfo of(Long routeId, Long startNodeId, Map<String, Double> startNode, Long endNodeId, Map<String, Double> endNode) {
        return new RouteCoordinatesInfo(routeId, startNodeId, startNode, endNodeId, endNode);
    }
}
