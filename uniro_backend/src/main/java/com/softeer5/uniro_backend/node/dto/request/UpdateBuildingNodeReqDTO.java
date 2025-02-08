package com.softeer5.uniro_backend.node.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(name = "UpdateBuildingNodeReqDTO", description = "건물 노드 정보 수정 요청 DTO")
public class UpdateBuildingNodeReqDTO {
    @Schema(description = "건물명", example = "공학관")
    private final String name;
    @Schema(description = "전화번호", example = "02-1234-1234")
    private final String phoneNumber;
    @Schema(description = "주소", example = "한양로 123번길123")
    private final String address;
    @Schema(description = "이미지", example = "")
    private final String imageUrl; // 추후 S3학습 후 변경예정
    @Schema(description = "레벨(지도 축척에 따른 노출정도, 1~10)", example = "3")
    private final int level;
}
