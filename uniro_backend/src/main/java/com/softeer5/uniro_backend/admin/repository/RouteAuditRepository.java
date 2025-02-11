package com.softeer5.uniro_backend.admin.repository;

import java.util.List;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.route.entity.Route;

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

}
