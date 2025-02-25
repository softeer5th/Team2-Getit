package com.softeer5.uniro_backend.admin.dto.response;

import com.softeer5.uniro_backend.map.dto.response.AllRoutesInfo;
import com.softeer5.uniro_backend.map.dto.response.GetRiskRoutesResDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Schema(name = "GetAllRoutesByRevisionResDTO", description = "특정 버전 map 조회 응답 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class GetAllRoutesByRevisionResDTO {
    @Schema(description = "특정 버전에 존재하는 길&노드 스냅샷 정보", example = "")
    private final AllRoutesInfo routesInfo;
    @Schema(description = "특정 버전에 존재하는 위험 요소 스냅샷 정보", example = "")
    private final GetRiskRoutesResDTO getRiskRoutesResDTO;
    @Schema(description = "삭제된 길&노드 정보 정보", example = "")
    private final LostRoutesDTO lostRoutes;
    @Schema(description = "현재 버전과 비교하여 변경된 주의/위험 요소 정보", example = "")
    private final List<ChangedRouteDTO> changedList;

    public static GetAllRoutesByRevisionResDTO of(AllRoutesInfo routesInfo, GetRiskRoutesResDTO getRiskRoutesResDTO,
                                                  LostRoutesDTO lostRoutes, List<ChangedRouteDTO> changedList) {
        return new GetAllRoutesByRevisionResDTO(routesInfo, getRiskRoutesResDTO, lostRoutes, changedList);
    }
}
