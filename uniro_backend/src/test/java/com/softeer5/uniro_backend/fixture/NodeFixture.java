package com.softeer5.uniro_backend.fixture;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;

import com.softeer5.uniro_backend.common.utils.GeoUtils;
import com.softeer5.uniro_backend.map.entity.Node;

public class NodeFixture {
	static GeometryFactory geometryFactory = GeoUtils.getInstance();

	public static Node createNode(double x, double y){
		return Node.builder()
			.univId(1001L)
			.isCore(false)
			.coordinates(geometryFactory.createPoint(new Coordinate(x,y)))
			.build();
	}

	public static Node createCoreNode(double x, double y){
		return Node.builder()
			.univId(1001L)
			.isCore(true)
			.coordinates(geometryFactory.createPoint(new Coordinate(x,y)))
			.build();
	}

	public static Node createNodeWithHeight(double x, double y, double height){
		return Node.builder()
				.univId(1001L)
				.isCore(false)
				.coordinates(geometryFactory.createPoint(new Coordinate(x,y)))
				.height(height)
				.build();
	}
}
