package com.softeer5.uniro_backend.map.service.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.softeer5.uniro_backend.map.entity.Node;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@Setter
@AllArgsConstructor
public class LightNode {
	private long id;
	private double lat;
	private double lng;

	@JsonProperty("core")
	private boolean isCore;

	public LightNode(Node node) {
		this.id = node.getId();
		this.lat = node.getY();
		this.lng = node.getX();
		this.isCore = node.isCore();
	}
}
