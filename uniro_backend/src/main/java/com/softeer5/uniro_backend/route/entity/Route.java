package com.softeer5.uniro_backend.route.entity;

import static jakarta.persistence.FetchType.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.softeer5.uniro_backend.resolver.CautionListConverter;
import com.softeer5.uniro_backend.resolver.DangerListConverter;
import com.softeer5.uniro_backend.node.entity.Node;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;
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
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Audited
public class Route {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private double cost;

	private LineString path;

	@ManyToOne(fetch = LAZY)
	@JoinColumn(referencedColumnName = "id", name = "node1_id")
	@Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
	@NotNull
	private Node node1;

	@ManyToOne(fetch = LAZY)
	@JoinColumn(referencedColumnName = "id", name = "node2_id")
	@Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
	@NotNull
	private Node node2;

	@Column(name = "univ_id")
	private Long univId;

	@Column(name = "core_route_id")
	private Long coreRouteId;

	@Convert(converter = CautionListConverter.class)
	@Column(name = "caution_factors")
	@NotNull
	private Set<CautionType> cautionFactors = new HashSet<>();

	@Convert(converter = DangerListConverter.class)
	@Column(name = "danger_factors")
	@NotNull
	private Set<DangerType> dangerFactors = new HashSet<>();

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

	@Builder
	private Route(double cost, LineString path, Node node1, Node node2, Long univId, Long coreRouteId,
		Set<CautionType> cautionFactors, Set<DangerType> dangerFactors) {
		this.cost = cost;
		this.path = path;
		this.node1 = node1;
		this.node2 = node2;
		this.univId = univId;
		this.coreRouteId = coreRouteId;
		this.cautionFactors = cautionFactors;
		this.dangerFactors = dangerFactors;
	}
}
