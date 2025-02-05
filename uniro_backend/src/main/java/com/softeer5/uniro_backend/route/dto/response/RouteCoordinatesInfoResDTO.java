package com.softeer5.uniro_backend.route.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Schema(name = "RouteCoordinatesInfo", description = "코어 루트 정보 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RouteCoordinatesInfoResDTO {

    @Schema(description = "간선 id", example = "2")
    private final Long routeId;

    @Schema(description = "시작 노드 id", example = "23")
    private final Long startNodeId;

    @Schema(description = "종료 노드 id", example = "54")
    private final Long endNodeId;

    public static RouteCoordinatesInfoResDTO of(Long routeId, Long startNodeId, Long endNodeId) {
        return new RouteCoordinatesInfoResDTO(routeId, startNodeId, endNodeId);
    }
}
