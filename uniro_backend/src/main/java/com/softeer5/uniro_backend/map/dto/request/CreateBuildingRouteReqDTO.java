package com.softeer5.uniro_backend.map.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(name = "CreateBuildingRouteReqDTO", description = "빌딩과 연결된 길 추가 요청 DTO")
public class CreateBuildingRouteReqDTO {
    @Schema(description = "빌딩 노드의 id", example = "16")
    @NotNull
    private final Long buildingNodeId;

    @Schema(description = "빌딩 노드와 연결될 노드의 id", example = "27")
    @NotNull
    private final Long nodeId;
}
