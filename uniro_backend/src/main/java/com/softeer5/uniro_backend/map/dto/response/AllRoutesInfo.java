package com.softeer5.uniro_backend.map.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Schema(name = "GetAllRoutesResDTO", description = "모든 노드,루트 조회 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class AllRoutesInfo {

    @Schema(description = "노드 정보 (id, 좌표)", example = "")
    private final List<NodeInfoResDTO> nodeInfos;
    @Schema(description = "루트 정보 (id, startNodeId, endNodeId)", example = "")
    private final List<CoreRouteResDTO> coreRoutes;
    @Schema(description = "빌딩 루트 정보 (id, startNodeId, endNodeId)", example = "")
    private final List<BuildingRouteResDTO> buildingRoutes;
    @Schema(description = "버전 id", example = "230")
    private final Long versionId;

    public static AllRoutesInfo of(List<NodeInfoResDTO> nodeInfos, List<CoreRouteResDTO> coreRoutes,
                                        List<BuildingRouteResDTO> buildingRoutes, Long versionId) {
        return new AllRoutesInfo(nodeInfos, coreRoutes, buildingRoutes, versionId);
    }
}
