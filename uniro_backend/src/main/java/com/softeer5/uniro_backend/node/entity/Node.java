package com.softeer5.uniro_backend.node.entity;


import static com.softeer5.uniro_backend.common.constant.UniroConst.*;

import java.util.Map;

import lombok.*;
import org.locationtech.jts.geom.Point;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@ToString
public class Node {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
	@Column(columnDefinition = "POINT SRID 4326")
	private Point coordinates;

	private double height;

	@Column(name = "is_core")
	private boolean isCore;

	@Column(name = "univ_id")
	@NotNull
	private Long univId;

	public Map<String, Double> getXY(){
		return Map.of("lat", coordinates.getY(), "lng", coordinates.getX());
	}

	public void setHeight(double height) {
		this.height = height;
	}

	public void setCoordinates(Point coordinates) {
		this.coordinates = coordinates;
	}

	public void setCore(boolean isCore){
		this.isCore = isCore;
	}

	public String getNodeKey() {
		return coordinates.getX() + NODE_KEY_DELIMITER + coordinates.getY();
	}

	@Builder
	private Node(Point coordinates, double height, boolean isCore, Long univId) {
		this.coordinates = coordinates;
		this.height = height;
		this.isCore = isCore;
		this.univId = univId;
	}
}
