package com.softeer5.uniro_backend.route.entity;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.LineString;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class CoreRoute {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(columnDefinition = "geometry(LineString, 4326)") // WGS84 좌표계
	private LineString path;

	private Long node1Id;

	private Long node2Id;

	private Long univId;

	public List<Map<String, Double>> getPathAsList() {
		List<Map<String, Double>> coordinatesList = new ArrayList<>();
		for (Coordinate coordinate : path.getCoordinates()) {
			coordinatesList.add(Map.of("lat", coordinate.getY(), "lng", coordinate.getX()));
		}
		return coordinatesList;
	}
}
