package com.softeer5.uniro_backend.admin.repository;

import java.util.List;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.node.entity.Node;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
@Transactional
public class NodeAuditRepository {
	private final EntityManager entityManager;

	public List<Node> getAllNodesAtRevision(Long univId, Long versionId) {
		AuditReader auditReader = AuditReaderFactory.get(entityManager);
		return auditReader.createQuery()
			.forEntitiesAtRevision(Node.class, versionId)
			.add(AuditEntity.property("univId").eq(univId))
			.getResultList();
	}

	public void deleteAllAfterVersionId(Long univId, Long versionId) {
		entityManager.createNativeQuery("DELETE FROM node_aud WHERE univ_id = :univId AND rev > :versionId")
			.setParameter("univId", univId)
			.setParameter("versionId", versionId)
			.executeUpdate();
	}
}
