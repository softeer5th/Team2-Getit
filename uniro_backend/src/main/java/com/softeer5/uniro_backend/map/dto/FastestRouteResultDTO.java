package com.softeer5.uniro_backend.map.dto;

import com.softeer5.uniro_backend.map.dto.response.RouteInfoResDTO;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class FastestRouteResultDTO {
    private final boolean hasCaution;
    private final boolean hasDanger;
    private final double totalDistance;
    private final double heightIncreaseWeight;
    private final double heightDecreaseWeight;
    private final List<RouteInfoResDTO> routeInfoDTOS;

    public static FastestRouteResultDTO of(boolean hasCaution,
                                           boolean hasDanger,
                                           double totalDistance,
                                           double heightIncreaseWeight,
                                           double heightDecreaseWeight,
                                           List<RouteInfoResDTO> routeInfoDTOS){
        return new FastestRouteResultDTO(hasCaution,
                hasDanger,
                totalDistance,
                heightIncreaseWeight,
                heightDecreaseWeight,
                routeInfoDTOS);
    }
}
