package com.softeer5.uniro_backend.node.dto;

import com.querydsl.core.annotations.QueryProjection;
import com.softeer5.uniro_backend.node.entity.Building;
import com.softeer5.uniro_backend.node.entity.Node;

import lombok.Getter;

@Getter
public class BuildingNode {
	private final Building building;
	private final Node node;

	@QueryProjection
	public BuildingNode(Building building, Node node) {
		this.building = building;
		this.node = node;
	}
}
