package com.softeer5.uniro_backend.route;

import static jakarta.persistence.FetchType.*;

import java.util.List;

import com.softeer5.uniro_backend.common.RiskListConverter;
import com.softeer5.uniro_backend.node.Node;
import org.locationtech.jts.geom.LineString;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Route {
	@Id
	private Long id;
	private double cost;
	@Column(columnDefinition = "geometry(LineString, 4326)") // WGS84 좌표계
	private LineString path;

	@ManyToOne(fetch = LAZY)
	@JoinColumn(referencedColumnName = "id", name = "node1_id", nullable = false)
	private Node node1;

	@ManyToOne(fetch = LAZY)
	@JoinColumn(referencedColumnName = "id", name = "node2_id", nullable = false)
	private Node node2;

	@Column(name = "univ_id")
	private Long univId;
	//
	// @Convert(converter = RiskListConverter.class)
	// private List<RiskType> cautionFactors;
	// @Convert(converter = RiskListConverter.class)
	// private List<RiskType> dangerFactors;

}
