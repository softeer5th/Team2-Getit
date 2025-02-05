package com.softeer5.uniro_backend.route.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class CreateRouteReqDTO {
    private final Long startNodeId;
    private final Long endNodeId;
    private final List<CreateRouteCoordinates> coordinates;
}
