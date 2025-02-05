package com.softeer5.uniro_backend.route.dto.response;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.Map;

@Getter
@Schema(name = "NodeInfoDTO", description = "노드 정보 DTO")
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class NodeInfoResDTO {

    @Schema(description = "노드 ID", example = "10")
    private final Long nodeId;

    @Schema(description = "x 좌표 (위도 및 경도)", example = "127.123456")
    private final double lng;

    @Schema(description = "y 좌표 (위도 및 경도)", example = "37.123456")
    private final double lat;

    public static NodeInfoResDTO of(Long nodeId, double lng, double lat) {
        return new NodeInfoResDTO(nodeId, lng, lat);
    }
}
