package com.softeer5.uniro_backend.route;

import org.locationtech.jts.geom.LineString;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class CoreRoute {
	@Id
	private Long id;
	@Column(columnDefinition = "geometry(LineString, 4326)") // WGS84 좌표계
	private LineString path;
}
