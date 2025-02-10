package com.softeer5.uniro_backend.route.dto.request;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(name = "CreateRoutesReqDTO", description = "길 생성 노드 목록 정보 DTO")
public class CreateRoutesReqDTO {

    @Schema(description = "시작 노드 id", example = "3")
    @NotNull
    private final Long startNodeId;

    @Schema(description = "종료 노드 id", example = "4")
    private final Long endNodeId;

    @Schema(description = "노드 좌표", example = "")
    @NotEmpty
    private final List<CreateRouteReqDTO> coordinates;
}
