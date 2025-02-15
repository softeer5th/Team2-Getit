package com.softeer5.uniro_backend.admin.repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.map.entity.Route;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
@Transactional
public class RouteAuditRepository {

	private final EntityManager entityManager;

	public List<Route> getAllRoutesAtRevision(Long univId, Long versionId) {
		AuditReader auditReader = AuditReaderFactory.get(entityManager);
		return auditReader.createQuery()
			.forEntitiesAtRevision(Route.class, versionId)
			.add(AuditEntity.property("univId").eq(univId))
			.getResultList();
	}

	public void deleteAllAfterVersionId(Long univId, Long versionId) {
		entityManager.createNativeQuery("DELETE FROM route_aud WHERE univ_id = :univId AND rev > :versionId")
			.setParameter("univId", univId)
			.setParameter("versionId", versionId)
			.executeUpdate();
	}

	public List<Route> findUpdatedRouteByUnivIdWithNodes(Long univId, Long versionId) {
		AuditReader auditReader = AuditReaderFactory.get(entityManager);
		List<Route> allRevisions = auditReader.createQuery()
				.forRevisionsOfEntity(Route.class, true, true)
				.add(AuditEntity.revisionNumber().gt(versionId))
				.getResultList();

		Map<Long, Route> uniqueRoutesMap = new HashMap<>();
		for (Route route : allRevisions) {
			// 이미 해당 엔티티 ID가 존재하면, 여기서 최신 리비전을 선택하는 로직을 추가할 수 있음
			uniqueRoutesMap.put(route.getId(), route);
		}
		return new ArrayList<>(uniqueRoutesMap.values());
	}
}
