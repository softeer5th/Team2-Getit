package com.softeer5.uniro_backend.route.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class FastestRouteResDTO {
    private boolean hasCaution;
    private double totalDistance;
    private double totalCost;
    private List<RouteInfoDTO> routes;
    private List<RouteDetailDTO> routeDetails;
}
