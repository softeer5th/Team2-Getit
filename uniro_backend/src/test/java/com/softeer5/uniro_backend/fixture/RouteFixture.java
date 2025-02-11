package com.softeer5.uniro_backend.fixture;

import java.util.HashSet;

import org.locationtech.jts.geom.GeometryFactory;

import com.softeer5.uniro_backend.common.utils.GeoUtils;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.route.entity.Route;

public class RouteFixture {
	static GeometryFactory geometryFactory = GeoUtils.getInstance();

	public static Route createRoute(Node node1, Node node2){
		return Route.builder()
			.node1(node1)
			.node2(node2)
			.univId(1001L)
			.cautionFactors(new HashSet<>())
			.dangerFactors(new HashSet<>())
			.build();
	}
}
