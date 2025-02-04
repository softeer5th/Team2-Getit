package com.softeer5.uniro_backend.route.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Schema(name = "GetAllRoutesResDTO", description = "모든 노드,루트 조회 DTO")
public class GetAllRoutesResDTO {
    @Schema(description = "노드 정보 (id, 좌표)", example = "")
    private final List<NodeInfo> nodeInfos;
    @Schema(description = "루트 정보 (id, startNodeId, endNodeId)", example = "")
    private final List<CoreRouteDTO> coreRoutes;


    private GetAllRoutesResDTO(List<NodeInfo> nodeInfos, List<CoreRouteDTO> coreRoutes){
        this.nodeInfos = nodeInfos;
        this.coreRoutes = coreRoutes;
    }

    public static GetAllRoutesResDTO of(List<NodeInfo> nodeInfos, List<CoreRouteDTO> coreRoutes){
        return new GetAllRoutesResDTO(nodeInfos, coreRoutes);
    }
}
