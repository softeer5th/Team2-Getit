package com.softeer5.uniro_backend.route.dto;


import lombok.*;

import java.util.Map;

@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Setter
public class NodeInfo{
    private final Long nodeId;
    private final Map<String, Double> coordinates;

    public static NodeInfo of(Long nodeId, Map<String, Double> coordinates) {
        return new NodeInfo(nodeId, coordinates);
    }
}
