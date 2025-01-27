package com.softeer5.uniro_backend.node.entity;


import java.util.Map;

import org.locationtech.jts.geom.Point;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@ToString
public class Node {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotNull
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

}
