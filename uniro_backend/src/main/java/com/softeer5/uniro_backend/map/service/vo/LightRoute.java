package com.softeer5.uniro_backend.map.service.vo;

import java.io.Serializable;

import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.entity.Route;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@NoArgsConstructor
@Setter
@AllArgsConstructor
public class LightRoute implements Serializable {
	private long id;
	private double distance;
	private LightNode node1;
	private LightNode node2;

	public LightRoute(Route route) {
		this.id = route.getId();
		this.distance = route.getDistance();
		this.node1 = new LightNode(route.getNode1());
		this.node2 = new LightNode(route.getNode2());
	}

	public LightRoute(long id, double distance, Node node1, Node node2) {
		this.id = id;
		this.distance = distance;
		this.node1 = new LightNode(node1);
		this.node2 = new LightNode(node2);
	}
}
