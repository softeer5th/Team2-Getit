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

import com.softeer5.uniro_backend.map.entity.Node;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
@Transactional
public class NodeAuditRepository {
	private final EntityManager entityManager;

	public List<Node> getAllNodesAtRevision(Long univId, Long versionId) {
		AuditReader auditReader = AuditReaderFactory.get(entityManager);
		List<Node> allRevisions = auditReader.createQuery()
				.forRevisionsOfEntity(Node.class, true, true)
				.add(AuditEntity.revisionNumber().le(versionId))
				.add(AuditEntity.property("univId").eq(univId))
				.addOrder(AuditEntity.revisionNumber().asc())
				.getResultList();

		Map<Long, Node> uniqueNodesMap = new HashMap<>();
		for (Node node : allRevisions) {
			uniqueNodesMap.put(node.getId(), node);
		}
		return new ArrayList<>(uniqueNodesMap.values());
	}

	public void deleteAllAfterVersionId(Long univId, Long versionId) {
		entityManager.createNativeQuery("DELETE FROM node_aud WHERE univ_id = :univId AND rev > :versionId")
			.setParameter("univId", univId)
			.setParameter("versionId", versionId)
			.executeUpdate();
	}
}
