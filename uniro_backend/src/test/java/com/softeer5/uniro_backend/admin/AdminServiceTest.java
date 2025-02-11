

package com.softeer5.uniro_backend.admin;

import static org.assertj.core.api.Assertions.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.hibernate.envers.query.AuditQuery;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlGroup;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.softeer5.uniro_backend.admin.annotation.RevisionOperation;
import com.softeer5.uniro_backend.admin.entity.RevInfo;
import com.softeer5.uniro_backend.admin.entity.RevisionOperationType;
import com.softeer5.uniro_backend.admin.repository.RevInfoTestRepository;
import com.softeer5.uniro_backend.admin.service.AdminService;
import com.softeer5.uniro_backend.admin.setting.RevisionContext;
import com.softeer5.uniro_backend.fixture.NodeFixture;
import com.softeer5.uniro_backend.fixture.RouteFixture;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.node.repository.NodeRepository;
import com.softeer5.uniro_backend.node.repository.NodeTestRepository;
import com.softeer5.uniro_backend.route.entity.DangerFactor;
import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.repository.RouteRepository;
import com.softeer5.uniro_backend.route.repository.RouteTestRepository;

import jakarta.persistence.EntityManager;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@SqlGroup({
	@Sql(value = "/sql/delete-all-data.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
})
class AdminServiceTest {

	@Autowired
	private AdminService adminService;

	@Autowired
	private NodeRepository nodeRepository;

	@Autowired
	private RouteRepository routeRepository;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private NodeTestRepository nodeTestRepository;

	@Autowired
	private RouteTestRepository routeTestRepository;

	@Autowired
	private RevInfoTestRepository revInfoTestRepository;

	@BeforeEach
	void revisionContextInit(){
		RevisionContext.setUnivId(1001L);
	}

	@AfterEach
	void revisionContextClear(){
		RevisionContext.clear();
	}

	@Test
	void save_시점마다_version은_다르다() {
		// given
		Node node1 = NodeFixture.createNode(1, 1);
		Node node2 = NodeFixture.createNode(1, 2);
		Node node3 = NodeFixture.createNode(1, 3);

		Node savedNode1 = nodeRepository.save(node1);
		Node savedNode2 = nodeRepository.save(node2);
		nodeRepository.save(node3);

		savedNode1.setCore(true);
		savedNode2.setCore(true);
		nodeRepository.save(savedNode1);
		nodeRepository.save(savedNode2);

		// when
		EntityManager freshEntityManager = entityManager.getEntityManagerFactory().createEntityManager();  // ✅ 새로운 EntityManager 생성
		AuditReader auditReader = AuditReaderFactory.get(freshEntityManager);

		// then
		List<Node> revNodes = auditReader.createQuery()
			.forEntitiesAtRevision(Node.class, 4)
			.add(AuditEntity.property("univId").eq(1001))
			.getResultList();

		assertThat(revNodes).hasSize(3);
		for(Node revNode : revNodes) {
			if(revNode.getId() == 1) {
				assertThat(revNode.isCore()).isTrue();
			} else {
				assertThat(revNode.isCore()).isFalse();
			}
		}
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

	@Test
	void 하나의_트랜잭션에는_하나의_버전이_생긴다() {
		// Given
		Node node1 = NodeFixture.createNode(1, 1);
		Node node2 = NodeFixture.createNode(1, 2);
		Node node3 = NodeFixture.createNode(1, 3);
		Node node4 = NodeFixture.createNode(2,2);

		Route route1 = RouteFixture.createRoute(node1, node2);
		Route route2 = RouteFixture.createRoute(node2, node3);
		Route route3 = RouteFixture.createRoute(node3, node4);

		// When
		List<Node> nodes = nodeRepository.saveAll(List.of(node1, node2));  // ver 1
		List<Node> nodes2 = nodeRepository.saveAll(List.of(node3, node4));  // ver 2

		// Then
		EntityManager freshEntityManager = entityManager.getEntityManagerFactory().createEntityManager();  // ✅ 새로운 EntityManager 생성
		AuditReader auditReader = AuditReaderFactory.get(freshEntityManager);

		List<Object[]> resultList = auditReader.createQuery()
			.forRevisionsOfEntity(Node.class, false, true)
			.addOrder(AuditEntity.revisionNumber().desc()) // 가장 최신 버전부터 내림차순 정렬
			.getResultList();

		RevInfo revInfo1 = (RevInfo)resultList.get(0)[1];
		RevInfo revInfo2 = (RevInfo)resultList.get(1)[1];

		assertThat(revInfo1.getRev()).isEqualTo(2);
		assertThat(revInfo2.getRev()).isEqualTo(2);
	}

	@Test
	void 정상적으로_리비전_롤백() {
		Node node1 = NodeFixture.createNode(1, 1);
		Node node2 = NodeFixture.createNode(1, 2);
		Node node3 = NodeFixture.createNode(1, 3);
		Node node4 = NodeFixture.createNode(2,2);
		Node rollbackNode = NodeFixture.createNode(1, 4);

		Route route1 = RouteFixture.createRoute(node1, node2);
		Route route2 = RouteFixture.createRoute(node2, node3);
		Route route3 = RouteFixture.createRoute(node3, node4);
		Route rollbackRoute = RouteFixture.createRoute(node1, rollbackNode);

		List<Node> nodes = nodeRepository.saveAll(List.of(node1, node2, node3, node4));  // ver 1
		List<Route> routes = routeRepository.saveAll(List.of(route1, route2, route3)); // ver2

		nodes.forEach(node -> node.setCore(true));
		nodeRepository.saveAll(List.of(node1, node2, node3, node4)); // ver3

		List<DangerFactor> dangerFactorsList = new ArrayList<>();
		dangerFactorsList.add(DangerFactor.SLOPE);
		routes.get(0).setDangerFactors(dangerFactorsList);
		Route savedRoute = routeRepository.save(routes.get(0)); // ver4

		dangerFactorsList.add(DangerFactor.CURB);
		routes.get(1).setDangerFactors(dangerFactorsList);
		Route deletedRoute = routeRepository.save(routes.get(1));// ver5

		nodeRepository.save(rollbackNode); // ver6
		routeRepository.save(rollbackRoute); // ver7

		// When
		adminService.rollbackRev(1001L, 4L);

		// Then
		EntityManager freshEntityManager = entityManager.getEntityManagerFactory().createEntityManager();  // ✅ 새로운 EntityManager 생성
		AuditReader auditReader = AuditReaderFactory.get(freshEntityManager);

		// a. 롤백 버전 이후 버전 데이터 확인
		// a-1. routeRepository
		List<Route> rollbackRoutes = routeTestRepository.findAll();
		assertThat(rollbackRoutes).hasSize(3);

		// a-2. nodeRepository
		List<Node> rollbackNodes = nodeTestRepository.findAll();
		assertThat(rollbackNodes).hasSize(4);
		rollbackNodes.forEach(node -> {
			assertThat(node.isCore()).isTrue();
		});

		// a-3. routeAuditRepository
		List<Route> resultList1 = auditReader.createQuery()
			.forEntitiesAtRevision(Route.class, 4)
			.add(AuditEntity.property("univId").eq(1001))
			.add(AuditEntity.property("id").eq(savedRoute.getId()))
			.getResultList();

		assertThat(resultList1).hasSize(1);
		Route revRoute = resultList1.get(0);
		assertThat(revRoute.getDangerFactors()).isEqualTo(Set.of(DangerFactor.SLOPE));

		// a-4. nodeAuditRepository
		List<Node> resultList2 = auditReader.createQuery()
			.forEntitiesAtRevision(Node.class, 4)
			.add(AuditEntity.property("univId").eq(1001))
			.getResultList();

		resultList2.forEach(node -> {
				assertThat(node.isCore()).isTrue();
			});

		// a-5. revInfoRepository
		List<RevInfo> revInfos = revInfoTestRepository.findAll();
		assertThat(revInfos).hasSize(4);
	}
}

