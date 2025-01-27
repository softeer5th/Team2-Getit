package com.softeer5.uniro_backend.node;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

import java.util.Map;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Node {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

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
