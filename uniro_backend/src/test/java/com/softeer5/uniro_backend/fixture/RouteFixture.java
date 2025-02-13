package com.softeer5.uniro_backend.fixture;

import java.util.HashSet;
import java.util.List;

import org.locationtech.jts.geom.GeometryFactory;

import com.softeer5.uniro_backend.common.utils.GeoUtils;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.entity.Route;

import static com.softeer5.uniro_backend.common.utils.GeoUtils.convertDoubleToLineString;

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

	public static Route createRouteWithPath(Node node1, Node node2){
		return Route.builder()
				.node1(node1)
				.node2(node2)
				.univId(1001L)
				.cautionFactors(new HashSet<>())
				.dangerFactors(new HashSet<>())
				.path(convertDoubleToLineString(List.of(new double[]{1.0, 2.0}, new double[]{3.0, 4.0})))
				.build();
	}
}
