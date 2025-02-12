

package com.softeer5.uniro_backend.admin;

import static org.assertj.core.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.softeer5.uniro_backend.admin.dto.response.ChangedRouteDTO;
import com.softeer5.uniro_backend.admin.dto.response.GetAllRoutesByRevisionResDTO;
import com.softeer5.uniro_backend.admin.dto.response.LostRoutesDTO;
import com.softeer5.uniro_backend.route.dto.response.*;
import com.softeer5.uniro_backend.route.entity.CautionFactor;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
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

import com.softeer5.uniro_backend.admin.entity.RevInfo;
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

	@Test
	void 특정_버전_조회_테스트_with_길추가(){
		Node node1 = NodeFixture.createNode(1, 1);
		Node node2 = NodeFixture.createNode(1, 2);
		Node node3 = NodeFixture.createNode(1, 3);
		Node node4 = NodeFixture.createNode(2,2);

		Route route1 = RouteFixture.createRoute(node1, node2);
		Route route2 = RouteFixture.createRoute(node2, node3);
		Route route3 = RouteFixture.createRoute(node3, node4);

		nodeRepository.saveAll(List.of(node1, node2));  // ver 1
		routeRepository.saveAll(List.of(route1)); // ver 2
		nodeRepository.saveAll(List.of(node3,node4));  // ver 3
		routeRepository.saveAll(List.of(route2, route3)); // ver 4

		//when
		GetAllRoutesByRevisionResDTO allRoutesByRevision = adminService.getAllRoutesByRevision(1001L, 2L);

		//then
		GetAllRoutesResDTO routesInfo = allRoutesByRevision.getRoutesInfo(); // 버전 2에 존재하는 map 정보
		LostRoutesDTO lostRoutes = allRoutesByRevision.getLostRoutes();  // 버전 3,4에 생성하여 버전2엔 존재하지 않는 routes

		//a. version2에 존재하는 맵 정보 확인

		//a-1. ver 2의 노드의 개수가 2개인지? (node1, node2)
		List<NodeInfoResDTO> nodeInfos = routesInfo.getNodeInfos(); // node 정보
		assertThat(nodeInfos).hasSize(2);

		//a-2. ver 2의 코어route 의 개수가 1개인지? (route1)
		List<CoreRouteResDTO> coreRoutes = routesInfo.getCoreRoutes();
		assertThat(coreRoutes).hasSize(1);

		//a-3. ver 2의 route의 개수가 1개인지? (route1)
		List<RouteCoordinatesInfoResDTO> routes = routesInfo.getCoreRoutes().get(0).getRoutes(); // core_route 정보
		assertThat(routes).hasSize(1);

		//a-4. ver2에 존재하는 route의 id가 route1과 같은지?
		Long routeId = routes.get(0).getRouteId(); // ver2의 route의 id
		assertThat(routeId).isEqualTo(route1.getId());



		//b. version2에 존재하지 않는 맵 정보 확인

		//b-1. ver 2에 존재하지 않는 노드가 2개인지? (node3, node4)
		List<NodeInfoResDTO> lostNodes = lostRoutes.getNodeInfos();
		assertThat(lostNodes).hasSize(2);

		//b-2. ver 2에 존재하는 코어route가 1개인지?
		List<CoreRouteResDTO> lostCoreRoutes = lostRoutes.getCoreRoutes();
		assertThat(lostCoreRoutes).hasSize(1);

		//b-2. ver 2에 존재하는 간선이 2개인지? (route2, route3)
		List<RouteCoordinatesInfoResDTO> lostRouteInfos = lostRoutes.getCoreRoutes().get(0).getRoutes();
		assertThat(lostRouteInfos).hasSize(2);

		//b-2. ver 2에 존재하지 않는 route가 route2, route3 인지?
		List<Long> lostRouteIds = lostRouteInfos.stream()
				.map(RouteCoordinatesInfoResDTO::getRouteId)
				.collect(Collectors.toList());

		assertThat(lostRouteIds)
				.containsExactlyInAnyOrder(route2.getId(), route3.getId());


	}

	@Test
	void 특정_버전_조회_테스트_with_길추가_2회이상(){
		Node node1 = NodeFixture.createNode(1, 1);
		Node node2 = NodeFixture.createNode(1, 2);
		Node node3 = NodeFixture.createNode(1, 3);
		Node node4 = NodeFixture.createNode(2,2);
		Node node5 = NodeFixture.createNode(0, 0);
		Node node6 = NodeFixture.createNode(-1, -1);

		Route route1 = RouteFixture.createRoute(node1, node2);
		Route route2 = RouteFixture.createRoute(node2, node3);
		Route route3 = RouteFixture.createRoute(node3, node4);
		Route route4 = RouteFixture.createRoute(node1, node5);
		Route route5 = RouteFixture.createRoute(node5, node6);

		nodeRepository.saveAll(List.of(node1, node2));  // ver 1
		routeRepository.saveAll(List.of(route1)); // ver 2

		nodeRepository.saveAll(List.of(node3,node4));  // ver 3
		routeRepository.saveAll(List.of(route2, route3)); // ver 4

		nodeRepository.saveAll(List.of(node5,node6));  // ver 5
		routeRepository.saveAll(List.of(route4, route5)); // ver 6

		//when
		GetAllRoutesByRevisionResDTO allRoutesByRevision = adminService.getAllRoutesByRevision(1001L, 2L);

		//then
		GetAllRoutesResDTO routesInfo = allRoutesByRevision.getRoutesInfo(); // 버전 2에 존재하는 map 정보
		LostRoutesDTO lostRoutes = allRoutesByRevision.getLostRoutes();  // 버전 3,4,5,6에 생성하여 버전2엔 존재하지 않는 routes

		//a. version2에 존재하는 맵 정보 확인

		//a-1. ver 2의 노드의 개수가 2개인지? (node1, node2)
		List<NodeInfoResDTO> nodeInfos = routesInfo.getNodeInfos(); // node 정보
		assertThat(nodeInfos).hasSize(2);

		//a-2. ver 2의 코어route 의 개수가 1개인지? (route1)
		List<CoreRouteResDTO> coreRoutes = routesInfo.getCoreRoutes();
		assertThat(coreRoutes).hasSize(1);

		//a-3. ver 2의 route의 개수가 1개인지? (route1)
		List<RouteCoordinatesInfoResDTO> routes = routesInfo.getCoreRoutes().get(0).getRoutes(); // core_route 정보
		assertThat(routes).hasSize(1);

		//a-4. ver2에 존재하는 route의 id가 route1과 같은지?
		Long routeId = routes.get(0).getRouteId(); // ver2의 route의 id
		assertThat(routeId).isEqualTo(route1.getId());


		//b. version2에 존재하지 않는 맵 정보 확인

		//b-1. ver 2에 존재하지 않는 노드가 2개인지? (node3, node4, node5, node6)
		List<NodeInfoResDTO> lostNodes = lostRoutes.getNodeInfos();
		assertThat(lostNodes).hasSize(4);

		//b-2. ver 2에 존재하는 코어route가 2개인지?
		List<CoreRouteResDTO> lostCoreRoutes = lostRoutes.getCoreRoutes();
		assertThat(lostCoreRoutes).hasSize(2);

		//b-2. ver 2에 존재하는 간선이 2개인지? (route2, route3, route4, route5)
		List<RouteCoordinatesInfoResDTO> lostRouteInfos = lostRoutes.getCoreRoutes().get(0).getRoutes();
		assertThat(lostRouteInfos).hasSize(4);

		//b-2. ver 2에 존재하지 않는 route가 route2, route3, route4, route5 인지?
		List<Long> lostRouteIds = lostRouteInfos.stream()
				.map(RouteCoordinatesInfoResDTO::getRouteId)
				.collect(Collectors.toList());

		assertThat(lostRouteIds)
				.containsExactlyInAnyOrder(route2.getId(), route3.getId(), route4.getId(), route5.getId());


	}

	@Test
	void 특정_버전_조회_테스트_with_위험_주의요소_변경(){
		Node node1 = NodeFixture.createNode(1, 1);
		Node node2 = NodeFixture.createNode(1, 2);
		Node node3 = NodeFixture.createNode(1, 3);
		Node node4 = NodeFixture.createNode(2,2);
		Node node5 = NodeFixture.createNode(3, 3);

		Route route1 = RouteFixture.createRoute(node1, node2);
		Route route2 = RouteFixture.createRoute(node2, node3);
		Route route3 = RouteFixture.createRoute(node3, node4);
		Route route4 = RouteFixture.createRoute(node4, node5);

		List<CautionFactor> cautionFactorsList1 = new ArrayList<>();
		cautionFactorsList1.add(CautionFactor.ETC);
		route1.setCautionFactors(cautionFactorsList1);

		nodeRepository.saveAll(List.of(node1, node2, node3));  // ver 1
		routeRepository.saveAll(List.of(route1, route2)); // ver 2
		nodeRepository.saveAll(List.of(node4,node5));  // ver 3
		routeRepository.saveAll(List.of(route3, route4)); // ver 4

		List<CautionFactor> cautionFactorsList2 = new ArrayList<>();
		cautionFactorsList1.add(CautionFactor.CRACK);
		route2.setCautionFactors(cautionFactorsList2);

		List<DangerFactor> dangerFactorsList = new ArrayList<>();
		dangerFactorsList.add(DangerFactor.SLOPE);
		route3.setDangerFactors(dangerFactorsList);

		routeRepository.save(route2); // ver 5
		routeRepository.save(route3); // ver 6

		//when
		GetAllRoutesByRevisionResDTO allRoutesByRevision = adminService.getAllRoutesByRevision(1001L, 2L);

		//then
		GetRiskRoutesResDTO getRiskRoutesResDTO = allRoutesByRevision.getGetRiskRoutesResDTO();
		List<ChangedRouteDTO> changedList = allRoutesByRevision.getChangedList();

		//a. version 2에 존재하는 맵 정보 확인

		//a-1. 기존의 caution이 1개인지? (route1)
		assertThat(getRiskRoutesResDTO.getCautionRoutes().size()).isEqualTo(1);

		//a-2. 기존의 caution이 route1인지?
		assertThat(getRiskRoutesResDTO.getCautionRoutes().get(0).getRouteId()).isEqualTo(route1.getId());

		//a-3. 변경된 caution이 1개인지? (route2)
		assertThat(changedList).hasSize(1);

		//a-4. 변경된 caution이 route2인지?
		assertThat(changedList.get(0).getRouteId()).isEqualTo(route2.getId());


	}


}

