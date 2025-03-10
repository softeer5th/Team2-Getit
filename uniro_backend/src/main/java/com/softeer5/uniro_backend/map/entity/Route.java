package com.softeer5.uniro_backend.map.entity;

import static jakarta.persistence.FetchType.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.softeer5.uniro_backend.common.resolver.CautionListConverter;
import com.softeer5.uniro_backend.common.resolver.DangerListConverter;
import com.softeer5.uniro_backend.map.enums.CautionFactor;
import com.softeer5.uniro_backend.map.enums.DangerFactor;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;
import org.locationtech.jts.geom.LineString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
@EntityListeners(AuditingEntityListener.class)
public class Route {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private double distance;

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

	@Convert(converter = CautionListConverter.class)
	@Column(name = "caution_factors")
	@NotNull
	private Set<CautionFactor> cautionFactors = new HashSet<>();

	@Convert(converter = DangerListConverter.class)
	@Column(name = "danger_factors")
	@NotNull
	private Set<DangerFactor> dangerFactors = new HashSet<>();

	@CreatedDate
	@Column(name = "created_at")
	private LocalDateTime createdAt;

	public List<CautionFactor> getCautionFactorsByList(){
		return cautionFactors.stream().toList();
	}

	public List<DangerFactor> getDangerFactorsByList(){
		return dangerFactors.stream().toList();
	}

	public void setCautionFactorsByList(List<CautionFactor> cautionFactors) {
		this.cautionFactors.clear();
		this.cautionFactors.addAll(cautionFactors);
	}

	public void setDangerFactorsByList(List<DangerFactor> dangerFactors) {
		this.dangerFactors.clear();
		this.dangerFactors.addAll(dangerFactors);
	}

	public void updateFromRevision(Route revRoute){
		this.cautionFactors = revRoute.getCautionFactors();
		this.dangerFactors = revRoute.getDangerFactors();
		this.distance = revRoute.distance;
	}

	public boolean isEqualRoute(Route route) {
		if(!route.getId().equals(this.getId())) return false;
		if(route.getDistance() != this.getDistance())return false;
		if(!route.getCautionFactors().equals(this.getCautionFactors())) return false;
		if(!route.getDangerFactors().equals(this.getDangerFactors())) return false;

		return true;
	}

	public void setNode1(Node node1) {
		this.node1 = node1;
	}
	public void setNode2(Node node2) {
		this.node2 = node2;
	}

	@Builder
	private Route(double distance, LineString path, Node node1, Node node2, Long univId,
				  Set<CautionFactor> cautionFactors, Set<DangerFactor> dangerFactors) {
		this.distance = distance;
		this.path = path;
		this.node1 = node1;
		this.node2 = node2;
		this.univId = univId;
		this.cautionFactors = cautionFactors;
		this.dangerFactors = dangerFactors;
	}
}
