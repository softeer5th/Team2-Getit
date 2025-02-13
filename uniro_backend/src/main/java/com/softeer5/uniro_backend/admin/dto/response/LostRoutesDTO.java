package com.softeer5.uniro_backend.admin.dto.response;

import com.softeer5.uniro_backend.map.dto.response.CoreRouteResDTO;
import com.softeer5.uniro_backend.map.dto.response.NodeInfoResDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Schema(name = "LostRoutesDTO", description = "삭제된 길의 코어 route DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class LostRoutesDTO {
    @Schema(description = "노드 정보 (id, 좌표)", example = "")
    private final List<NodeInfoResDTO> nodeInfos;
    @Schema(description = "루트 정보 (id, startNodeId, endNodeId)", example = "")
    private final List<CoreRouteResDTO> coreRoutes;

    public static LostRoutesDTO of(List<NodeInfoResDTO> nodeInfos, List<CoreRouteResDTO> coreRoutes){
        return new LostRoutesDTO(nodeInfos, coreRoutes);
    }
}
