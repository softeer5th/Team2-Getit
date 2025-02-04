package com.softeer5.uniro_backend.admin.dto;

import com.softeer5.uniro_backend.admin.entity.RevInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Schema(name = "GetBuildingResDTO", description = "건물 노드 조회 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RevInfoDTO {
    private final Long rev;                   // Revision 번호
    private final LocalDateTime revTime;     // Revision 시간
    private final Long univId;                //UnivId
    private final String action;              // 행위

    public static RevInfoDTO of(Long rev, LocalDateTime revTime, Long univId, String action) {
        return new RevInfoDTO(rev, revTime, univId, action);
    }
}