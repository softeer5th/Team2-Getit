package com.softeer5.uniro_backend.map.dto;

import com.softeer5.uniro_backend.map.entity.Route;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class FastestRouteDTO {
    private final Map<Long, Route> prevRoute;
    private final double totalWeightDistance;

    public static FastestRouteDTO of(Map<Long, Route> prevRoute, double totalWeightDistance) {
        return new FastestRouteDTO(prevRoute,totalWeightDistance);
    }
}
