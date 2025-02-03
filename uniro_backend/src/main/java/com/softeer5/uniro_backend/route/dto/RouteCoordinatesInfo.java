package com.softeer5.uniro_backend.route.dto;

import lombok.*;

import java.util.Map;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RouteCoordinatesInfo {
    private final Long routeId;
    private final NodeInfo startNode;
    private final NodeInfo endNode;

    @AllArgsConstructor
    @Getter
    @Setter
    private static class NodeInfo{
        private final Long nodeId;
        private final Map<String, Double> coordinates;
    }

    public static RouteCoordinatesInfo of(Long routeId, Long startNodeId, Map<String, Double> startNode, Long endNodeId, Map<String, Double> endNode) {
        return new RouteCoordinatesInfo(routeId, new NodeInfo(startNodeId,startNode),
                new NodeInfo(endNodeId, endNode));
    }
}
