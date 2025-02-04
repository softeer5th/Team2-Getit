package com.softeer5.uniro_backend.admin.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class RevInfoDTO {
    private Long rev;                   // Revision 번호
    private LocalDateTime revTime;     // Revision 시간
}