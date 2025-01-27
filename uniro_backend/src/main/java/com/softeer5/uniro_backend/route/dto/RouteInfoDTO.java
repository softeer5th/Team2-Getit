package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.entity.CautionType;
import lombok.Builder;
import lombok.Getter;
import java.util.Map;
import java.util.Set;

@Getter
@Builder
public class RouteInfoDTO {
    private Long routeId;
    private Map<String,Double> node1;
    private Map<String,Double> node2;
    Set<CautionType> cautionFactors;

}
