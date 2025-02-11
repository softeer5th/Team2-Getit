package com.softeer5.uniro_backend.admin;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.softeer5.uniro_backend.admin.service.AdminService;
import com.softeer5.uniro_backend.fixture.NodeFixture;
import com.softeer5.uniro_backend.fixture.RouteFixture;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.node.repository.NodeRepository;
import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.repository.RouteRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AdminServiceTest {

	@Autowired
	private AdminService adminService;

	@Autowired
	private NodeRepository nodeRepository;

	@Autowired
	private RouteRepository routeRepository;

	@Autowired
	private EntityManager entityManager;

	@Test
	void save_시점마다_version은_다르다() {
		// given
		// Node node1 = NodeFixture.createNode(1, 1);
		// Node node2 = NodeFixture.createNode(1, 2);
		// Node node3 = NodeFixture.createNode(1, 3);
		//
		// Node savedNode1 = nodeRepository.save(node1);
		// Node savedNode2 = nodeRepository.save(node2);
		// nodeRepository.save(node3);
		//
		// savedNode1.setCore(true);
		// savedNode2.setCore(true);
		// nodeRepository.save(savedNode1);
		// nodeRepository.save(savedNode2);
		//
		// // when
		// EntityManager freshEntityManager = entityManager.getEntityManagerFactory().createEntityManager();  // ✅ 새로운 EntityManager 생성
		// AuditReader auditReader = AuditReaderFactory.get(freshEntityManager);
		//
		// // then
		// List<Node> revNodes = auditReader.createQuery()
		// 	.forEntitiesAtRevision(Node.class, 4)
		// 	.add(AuditEntity.property("univId").eq(1001))
		// 	.getResultList();
		//
		// assertThat(revNodes).hasSize(3);
		// for(Node revNode : revNodes) {
		// 	if(revNode.getId() == 1) {
		// 		assertThat(revNode.isCore()).isTrue();
		// 	} else {
		// 		assertThat(revNode.isCore()).isFalse();
		// 	}
		// }
	}

	@Test
	void 롤백시_수정에_관해서_audit_관련_쿼리가_발생하지_않는다() {
		// given
		Node node1 = NodeFixture.createNode(1, 1);
		Node node2 = NodeFixture.createNode(1, 2);
		Node node3 = NodeFixture.createNode(1, 3);
		Node node4 = NodeFixture.createNode(2,2);

		Route route1 = RouteFixture.createRoute(node1, node2);
		Route route2 = RouteFixture.createRoute(node2, node3);
		Route route3 = RouteFixture.createRoute(node1, node4);

		Node savedNode1 = nodeRepository.save(node1);  // 1
		nodeRepository.save(node2);  // 2
		nodeRepository.save(node3); // 3

		routeRepository.save(route1); // 4
		routeRepository.save(route2); // 5

		nodeRepository.save(node4); // 6
		savedNode1.setCore(true);
		nodeRepository.save(savedNode1); // 7
		routeRepository.save(route3);  // 8

		long versionId = 4L;

		// when
		adminService.rollbackRev(1001L, versionId);

		// then
		EntityManager freshEntityManager = entityManager.getEntityManagerFactory().createEntityManager();  // ✅ 새로운 EntityManager 생성
		AuditReader auditReader = AuditReaderFactory.get(freshEntityManager);

		List<Object[]> auditChanges = auditReader.createQuery()
			.forRevisionsOfEntity(Node.class, false, true)
			.add(AuditEntity.id().eq(savedNode1.getId()))
			.add(AuditEntity.revisionNumber().gt(versionId))  // 4버전 이후 데이터 확인
			.getResultList();

		assertThat(auditChanges).isEmpty();
	}
}
