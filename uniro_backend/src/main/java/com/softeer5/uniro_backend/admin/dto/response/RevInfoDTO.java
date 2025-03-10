package com.softeer5.uniro_backend.admin.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Schema(name = "RevInfoDTO", description = "버전 정보 조회 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class RevInfoDTO {
    @Schema(description = "버전명", example = "4")
    private final Long rev;                   // Revision 번호
    @Schema(description = "버전 타임스탬프", example = "2025-02-04T17:56:06.832")
    private final LocalDateTime revTime;     // Revision 시간
    @Schema(description = "대학교 id", example = "1001")
    private final Long univId;                //UnivId
    @Schema(description = "변경사항 설명", example = "위험요소 추가")
    private final String action;              // 행위

    public static RevInfoDTO of(Long rev, LocalDateTime revTime, Long univId, String action) {
        return new RevInfoDTO(rev, revTime, univId, action);
    }
}