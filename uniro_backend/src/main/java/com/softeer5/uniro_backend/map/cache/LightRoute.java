package com.softeer5.uniro_backend.map.cache;

import java.io.Serializable;

import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.entity.Route;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
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
}
