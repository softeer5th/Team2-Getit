package com.softeer5.uniro_backend.map.dto.response;

import com.softeer5.uniro_backend.admin.dto.response.ChangedRouteDTO;
import com.softeer5.uniro_backend.admin.dto.response.LostRoutesDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@Schema(name = "GetChangedRoutesByRevisionResDTO", description = "현재 버전과 특정 버전의 차이점 조회 응답 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class GetChangedRoutesByRevisionResDTO {
    @Schema(description = "삭제된 길&노드 정보 정보", example = "")
    private final LostRoutesDTO lostRoutes;
    @Schema(description = "현재 버전과 비교하여 변경된 주의/위험 요소 정보", example = "")
    private final List<ChangedRouteDTO> changedList;
    @Schema(description = "최신 버전 id", example = "233")
    private final Long versionId;

    public static GetChangedRoutesByRevisionResDTO of(LostRoutesDTO lostRoutes, List<ChangedRouteDTO> changedList, Long versionId) {
        return new GetChangedRoutesByRevisionResDTO(lostRoutes,changedList, versionId);
    }
}
