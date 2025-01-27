package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.route.DirectionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RouteDetailDTO {
    private double dist;
    private DirectionType directionType;
}
