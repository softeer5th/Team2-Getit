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

    @Schema(description = "좌표", example = "{\"lng\": 127.123456, \"lat\": 37.123456}")
    private final Map<String, Double> coordinates;

    public static NodeInfoResDTO of(Long nodeId, Map<String, Double> coordinates) {
        return new NodeInfoResDTO(nodeId, coordinates);
    }
}
