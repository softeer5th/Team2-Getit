package com.softeer5.uniro_backend.admin.repository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.stereotype.Repository;

import com.softeer5.uniro_backend.node.entity.Node;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class NodeAuditRepository {
	private final EntityManager entityManager;

	public List<Node> getAllNodesAtRevision(Long versionId) {
		AuditReader auditReader = AuditReaderFactory.get(entityManager);

		List<Node> revNodes = auditReader.createQuery()
			.forRevisionsOfEntity(Node.class, true, true)
			.add(AuditEntity.revisionNumber().le(versionId))
			.getResultList();

		// id별로 최신 데이터만 추출
		Map<Long, Optional<Node>> latestRoutesById = revNodes.stream()
			.collect(Collectors.groupingBy(
				Node::getId,  // id를 기준으로 그룹화
				Collectors.maxBy(Comparator.comparing(Node::getCreatedAt)) // 최신 객체만 선택
			));

		// 최신 객체들만 리스트로 반환
		return latestRoutesById.values().stream()
			.map(Optional::get)
			.toList();
	}
}
