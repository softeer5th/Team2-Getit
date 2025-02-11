package com.softeer5.uniro_backend.map.entity;


import static com.softeer5.uniro_backend.common.constant.UniroConst.*;

import java.time.LocalDateTime;
import java.util.Map;

import jakarta.persistence.EntityListeners;
import lombok.*;
import org.hibernate.envers.Audited;
import org.locationtech.jts.geom.Point;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@ToString
@Audited
@EntityListeners(AuditingEntityListener.class)
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

	@CreatedDate
	private LocalDateTime createdAt;

	public Map<String, Double> getXY(){
		return Map.of("lat", coordinates.getY(), "lng", coordinates.getX());
	}

	public double getX(){
		return coordinates.getX();
	}

	public double getY(){
		return coordinates.getY();
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
	public void updateFromRevision(boolean isCore){
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
