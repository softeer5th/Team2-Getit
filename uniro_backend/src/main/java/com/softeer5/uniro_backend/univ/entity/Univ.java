package com.softeer5.uniro_backend.univ.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Univ {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(length = 20)
	@NotNull
	private String name;

	@Column(length = 20)
	@NotNull
	private String trimmedName;

	@Column(length = 200, name = "image_url")
	@NotNull
	private String imageUrl;

	// 학교 중점
	@Column(name = "center_point")
	@NotNull
	private Point centerPoint;

	// 학교 좌상단 점
	@Column(name = "left_top_point")
	@NotNull
	private Point leftTopPoint;

	// 학교 우하단 점
	@Column(name = "right_bottom_point")
	@NotNull
	private Point rightBottomPoint;

	// 학교 폴리곤
	@Column(name = "area_polygon")
	@NotNull
	private Polygon areaPolygon;

	@Column(name = "limit_version")
	private Long limitVersion;

	public Map<String, Double> getCenterXY(){
		return Map.of("lat", centerPoint.getY(), "lng", centerPoint.getX());
	}

	public Map<String, Double> getLeftTopXY(){
		return Map.of("lat", leftTopPoint.getY(), "lng", leftTopPoint.getX());
	}

	public Map<String, Double> getRightBottomXY(){
		return Map.of("lat", leftTopPoint.getY(), "lng", leftTopPoint.getX());
	}

	public List<Map<String, Double>> getAreaPolygonXY(){
		List<Map<String, Double>> areaPolygonXY = new ArrayList<>();
		Coordinate[] coordinates = areaPolygon.getCoordinates();

		for(Coordinate coordinate : coordinates){
			areaPolygonXY.add(Map.of("lat", coordinate.getY(), "lng", coordinate.getX()));
		}

		return areaPolygonXY;
	}

}
