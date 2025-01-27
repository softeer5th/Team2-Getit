package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.RiskType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@Builder
public class RouteInfoDTO {
    private Long routeId;
    private Map<String,Double> node1;
    private Map<String,Double> node2;
    List<RiskType> cautionFactors;

}
