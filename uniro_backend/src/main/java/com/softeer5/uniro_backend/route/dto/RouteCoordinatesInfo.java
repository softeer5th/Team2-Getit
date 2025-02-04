package com.softeer5.uniro_backend.route.dto;

import lombok.*;

import java.util.Map;

@Getter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RouteCoordinatesInfo {
    private final Long routeId;
    private final Long startNodeId;
    private final Long endNodeId;

    public static RouteCoordinatesInfo of(Long routeId, Long startNodeId, Long endNodeId) {
        return new RouteCoordinatesInfo(routeId, startNodeId, endNodeId);
    }
}
