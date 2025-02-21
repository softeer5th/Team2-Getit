package com.softeer5.uniro_backend.map.entity;


import static com.softeer5.uniro_backend.common.constant.UniroConst.*;

import java.time.LocalDateTime;
import java.util.Map;

import com.softeer5.uniro_backend.map.enums.HeightStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;
import org.locationtech.jts.geom.Point;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

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

	@NotNull
	@NotNull
	@Enumerated(EnumType.STRING)
	private HeightStatus status;

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

	public void setStatus(HeightStatus status) {
		this.status = status;
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
	private Node(Point coordinates, double height, boolean isCore, Long univId, HeightStatus status) {
		this.coordinates = coordinates;
		this.height = height;
		this.isCore = isCore;
		this.univId = univId;
		this.status = status;
	}
}
