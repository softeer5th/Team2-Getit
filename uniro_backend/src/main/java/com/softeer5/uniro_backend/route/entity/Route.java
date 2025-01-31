package com.softeer5.uniro_backend.route.entity;

import static jakarta.persistence.FetchType.*;

import java.util.List;
import java.util.Set;

import com.softeer5.uniro_backend.resolver.CautionListConverter;
import com.softeer5.uniro_backend.resolver.DangerListConverter;
import com.softeer5.uniro_backend.node.entity.Node;
import org.locationtech.jts.geom.LineString;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Route {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private double cost;

	@Column(columnDefinition = "geometry(LineString, 4326)") // WGS84 좌표계
	private LineString path;

	@ManyToOne(fetch = LAZY)
	@JoinColumn(referencedColumnName = "id", name = "node1_id")
	@NotNull
	private Node node1;

	@ManyToOne(fetch = LAZY)
	@JoinColumn(referencedColumnName = "id", name = "node2_id")
	@NotNull
	private Node node2;

	@Column(name = "univ_id")
	private Long univId;

	@Column(name = "core_route_id")
	private Long coreRouteId;

	@Convert(converter = CautionListConverter.class)
	@Column(name = "caution_factors")
	private Set<CautionType> cautionFactors;

	@Convert(converter = DangerListConverter.class)
	@Column(name = "danger_factors")
	private Set<DangerType> dangerFactors;

	public List<CautionType> getCautionFactorsByList(){
		return cautionFactors.stream().toList();
	}

	public List<DangerType> getDangerFactorsByList(){
		return dangerFactors.stream().toList();
	}

	public void setCautionFactors(List<CautionType> cautionFactors) {
		this.cautionFactors.clear();
        this.cautionFactors.addAll(cautionFactors);
	}

	public void setDangerFactors(List<DangerType> dangerFactors) {
		this.dangerFactors.clear();
		this.dangerFactors.addAll(dangerFactors);
	}

}
