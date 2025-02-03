package com.softeer5.uniro_backend.route.dto;

import com.softeer5.uniro_backend.node.entity.Node;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.util.List;

@Getter
@Schema(name = "GetAllRoutesResDTO", description = "모든 노드,루트 조회 DTO")
public class GetAllRoutesResDTO {
    @Schema(description = "node1(코어노드) id", example = "3")
    private final Long coreNode1Id;
    @Schema(description = "node2(코어노드) id", example = "4")
    private final Long cordNode2Id;
    @Schema(description = "길을 이루는 좌표목록", example = "")
    private final List<RouteCoordinatesInfo> routes;


    private GetAllRoutesResDTO(Long coreNode1Id, Long cordNode2Id, List<RouteCoordinatesInfo> routes){
        this.coreNode1Id = coreNode1Id;
        this.cordNode2Id = cordNode2Id;
        this.routes = routes;
    }

    public static GetAllRoutesResDTO of(Long startNode, Long endNode, List<RouteCoordinatesInfo> routes){
        return new GetAllRoutesResDTO(startNode, endNode, routes);
    }
}
