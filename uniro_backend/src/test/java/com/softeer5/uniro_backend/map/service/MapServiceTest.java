package com.softeer5.uniro_backend.map.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.softeer5.uniro_backend.common.TestContainerConfig;
import com.softeer5.uniro_backend.common.exception.custom.RouteCalculationException;
import com.softeer5.uniro_backend.external.MapClient;
import com.softeer5.uniro_backend.fixture.NodeFixture;
import com.softeer5.uniro_backend.fixture.RouteFixture;
import com.softeer5.uniro_backend.map.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.dto.request.CreateRouteReqDTO;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.repository.RouteRepository;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
@Import(TestContainerConfig.class)
class MapServiceTest {

	@Container
	static final GenericContainer<?> redis = new GenericContainer<>("redis:7.0.8-alpine")
		.withExposedPorts(6379);

	@BeforeAll
	static void setup() {
		redis.start();
	}

	@DynamicPropertySource
	static void configureProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.data.redis.host", redis::getHost);
		registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
	}

	@Autowired
	private RouteCalculator routeCalculator;
	@Autowired
	private MapService mapService;
	@Autowired
	private RouteRepository routeRepository;
	@Autowired
	private NodeRepository nodeRepository;

	@MockBean
	private MapClient mapClient;

	@Nested
	class 경로추가{
		@Test
		void 기본_경로_생성() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(1, 1),
				new CreateRouteReqDTO(2, 2)
			);

			Node node0 = NodeFixture.createNode(-1, 0);
			Node node1 = NodeFixture.createNode(0, 0);
			Node node2 = NodeFixture.createNode(1, 0);

			Route route0 = RouteFixture.createRoute(node0, node1);
			Route route = RouteFixture.createRoute(node1, node2);

			nodeRepository.saveAll(List.of(node0, node1, node2));
			routeRepository.saveAll(List.of(route0, route));

			// When
			mapService.createRoute(univId, new CreateRoutesReqDTO(node1.getId(), null, requests));

			// Then
			List<Node> results = nodeRepository.findAll();
			assertThat(results).hasSize(5);
			assertThat(results.get(1).isCore()).isTrue();
		}

		@Test
		@DisplayName("wiki 페이지 TC.2")
		void 기존_경로와_겹치는_경우_예외발생() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(1, 1),
				new CreateRouteReqDTO(2, 2)
			);

			Node node1 = NodeFixture.createNode(0, 0);
			Node node2 = NodeFixture.createNode(1.5, 1.5);
			Route route = RouteFixture.createRoute(node1, node2);

			nodeRepository.saveAll(List.of(node1, node2));
			routeRepository.save(route);

			// when, then
			assertThatThrownBy(() -> mapService.createRoute(univId, new CreateRoutesReqDTO(node1.getId(), null, requests)))
				.isInstanceOf(RouteCalculationException.class)
				.hasMessageContaining("intersection is only allowed by point");
		}

		@Test
		void 연결된_간선이_3개가_된_경우_시작노드가_서브에서_코어노드로_변경된다() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(3, 3),
				new CreateRouteReqDTO(5, 3)
			);

			Node node0 = NodeFixture.createNode(0, -1);
			Node node1 = NodeFixture.createNode(0, 0);
			Node node2 = NodeFixture.createNode(0, 1);
			Node node3 = NodeFixture.createNode(0, 2);
			Node node4 = NodeFixture.createNode(0, 3);

			Route route0 = RouteFixture.createRoute(node0, node1);
			Route route1 = RouteFixture.createRoute(node1, node2);
			Route route2 = RouteFixture.createRoute(node2, node3);
			Route route3 = RouteFixture.createRoute(node3, node4);

			nodeRepository.saveAll(List.of(node0, node1, node2, node3, node4));
			routeRepository.saveAll(List.of(route0, route1, route2, route3));

			// When
			mapService.createRoute(univId, new CreateRoutesReqDTO(node1.getId(), null, requests));

			// Then
			List<Node> results = nodeRepository.findAll();
			assertThat(results).hasSize(7);
			assertThat(results.get(1).isCore()).isTrue();
		}

		@Test
		void 출발점과_도착점이_같은_경우_예외처리() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(1, 1),
				new CreateRouteReqDTO(0, 0)
			);

			Node node1 = NodeFixture.createNode(0, 0);
			Node node2 = NodeFixture.createNode(0, 1.5);
			Route route = RouteFixture.createRoute(node1, node2);

			nodeRepository.saveAll(List.of(node1, node2));
			routeRepository.save(route);

			// when, Then
			assertThatThrownBy(() -> mapService.createRoute(univId, new CreateRoutesReqDTO(node1.getId(), null, requests)))
				.isInstanceOf(RouteCalculationException.class);

		}

		@Test
		@DisplayName("wiki 페이지 TC.3")
		void 기존에_존재하는_노드와_연결할_경우_코어노드가_될_수_있다() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(2, 1),
				new CreateRouteReqDTO(2, 2),
				new CreateRouteReqDTO(0, 2),
				new CreateRouteReqDTO(-1, 2)
			);

			Node node1 = NodeFixture.createNode(0, 0);
			Node node2 = NodeFixture.createNode(0, 1);
			Node node3 = NodeFixture.createNode(0, 2);
			Node node3_1 = NodeFixture.createNode(0, 3);

			Route route1 = RouteFixture.createRoute(node1, node2);
			Route route2 = RouteFixture.createRoute(node2, node3);
			Route route2_1 = RouteFixture.createRoute(node3, node3_1);


			nodeRepository.saveAll(List.of(node1, node2, node3, node3_1));
			routeRepository.saveAll(List.of(route1, route2, route2_1));

			// When
			mapService.createRoute(univId, new CreateRoutesReqDTO(node1.getId(), null, requests) );

			// Then
			List<Node> results = nodeRepository.findAll();
			assertThat(results).hasSize(7);
			assertThat(results.get(0).isCore()).isFalse();
			assertThat(results.get(2).isCore()).isTrue();
		}

		@Test
		void 기존_경로와_동일한_경우_예외발생() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(1, 1),
				new CreateRouteReqDTO(2, 2)
			);

			Node node1 = NodeFixture.createNode(0, 0);
			Node node2 = NodeFixture.createNode(1, 1);
			Node node3 = NodeFixture.createNode(2, 2);
			Route route = RouteFixture.createRoute(node1, node2);
			Route route2 = RouteFixture.createRoute(node2, node3);

			nodeRepository.saveAll(List.of(node1, node2, node3));
			routeRepository.saveAll(List.of(route, route2));

			// when, then
			assertThatThrownBy(() -> mapService.createRoute(univId, new CreateRoutesReqDTO(node1.getId(), null, requests)))
				.isInstanceOf(RouteCalculationException.class)
				.hasMessageContaining("intersection is only allowed by point");
		}

		@Test
		@DisplayName("wiki 페이지 TC.4")
		void 지나치면서_셀프_크로스_되는_경우_새로_추가될_노드와_연결된다() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(0, 0.5),
				new CreateRouteReqDTO(0, 1.5),
				new CreateRouteReqDTO(0, 2.5),
				new CreateRouteReqDTO(1, 2),
				new CreateRouteReqDTO(-3, 1)
			);

			Node node1 = NodeFixture.createNode(0, 0);
			Node node2 = NodeFixture.createNode(0, -1);

			Route route1 = RouteFixture.createRoute(node1, node2);

			nodeRepository.saveAll(List.of(node1, node2));
			routeRepository.saveAll(List.of(route1));

			// When
			mapService.createRoute(univId, new CreateRoutesReqDTO(node1.getId(), null, requests));

			// Then
			List<Node> results = nodeRepository.findAll();
			assertThat(results).hasSize(7);
			assertThat(results.get(0).isCore()).isFalse();
			assertThat(results.get(3).isCore()).isTrue();
			System.out.println(results);
		}

		@Test
		@DisplayName("wiki 페이지 TC.5")
		void 새로_추가될_노드와_연결되면서_셀프_크로스_되는_경우_새로_추가될_노드와_연결된다() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(0, 0.5),
				new CreateRouteReqDTO(0, 1.5),
				new CreateRouteReqDTO(0, 2.5),
				new CreateRouteReqDTO(1, 2),
				new CreateRouteReqDTO(0, 1.5),
				new CreateRouteReqDTO(-3, 1)
			);

			Node node1 = NodeFixture.createNode(0, 0);
			Node node2 = NodeFixture.createNode(0, -1);

			Route route1 = RouteFixture.createRoute(node1, node2);

			List<Node> savedNodes = nodeRepository.saveAll(List.of(node1, node2));
			routeRepository.saveAll(List.of(route1));

			// When
			mapService.createRoute(univId, new CreateRoutesReqDTO(savedNodes.get(0).getId(), null, requests));

			// Then
			List<Node> results = nodeRepository.findAll();

			assertThat(results).hasSize(7);
			assertThat(results.get(0).isCore()).isFalse();
			System.out.println(results);
			assertThat(results.get(3).isCore()).isTrue();
		}

		@Test
		@DisplayName("wiki 페이지 TC.6")
		void 첫번째_노드에_연결되면서_셀프_크로스_되는_경우_새로_추가될_노드와_연결된다_() {
			// Given
			Long univId = 1001L;
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(0, 1),
				new CreateRouteReqDTO(0, 2),
				new CreateRouteReqDTO(1, 2),
				new CreateRouteReqDTO(0, 0),
				new CreateRouteReqDTO(-2, 0)
			);

			Node node0 = NodeFixture.createNode(1, -1);
			Node node1 = NodeFixture.createNode(0, 0);

			Route route1 = RouteFixture.createRoute(node0, node1);

			nodeRepository.saveAll(List.of(node0, node1));
			routeRepository.saveAll(List.of(route1));

			// When
			mapService.createRoute(univId, new CreateRoutesReqDTO(node1.getId(), null, requests) );

			// Then
			List<Node> results = nodeRepository.findAll();
			System.out.println(results);
			assertThat(results).hasSize(6);
			assertThat(results.get(1).isCore()).isTrue();
		}

		@Test
		@DisplayName("인접한 노드는 중복될 수 없다. a->b->b 경우 ")
		void nearest_test1(){
			// given
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(37.554533318727884, 127.040754103711),
				new CreateRouteReqDTO(37.554506962309226, 127.0407538544841),
				new CreateRouteReqDTO(37.554480605890554, 127.04075360525738),
				new CreateRouteReqDTO(37.5544542494719, 127.04075335603085),
				new CreateRouteReqDTO(37.554427893053244, 127.04075310680449),
				new CreateRouteReqDTO(37.55437473334863, 127.04076651784956),

				new CreateRouteReqDTO(37.55437473334863, 127.04076651784956),

				new CreateRouteReqDTO(37.554367645389384, 127.0407906577353),
				new CreateRouteReqDTO(37.55436055742524, 127.04081479761643),
				new CreateRouteReqDTO(37.554353469456174, 127.04083893749296),
				new CreateRouteReqDTO(37.55436126622311, 127.04086665364699),
				new CreateRouteReqDTO(37.55436906298358, 127.04089436980678),
				new CreateRouteReqDTO(37.55437685973755, 127.04092208597243),
				new CreateRouteReqDTO(37.55440095878911, 127.04091538046072),
				new CreateRouteReqDTO(37.554425057840305, 127.04090867494469),
				new CreateRouteReqDTO(37.554449156891096, 127.04090196942433),
				new CreateRouteReqDTO(37.55447325594152, 127.04089526389961),
				new CreateRouteReqDTO(37.55449735499156, 127.04088855837058),
				new CreateRouteReqDTO(37.55452145404122, 127.0408818528372),
				new CreateRouteReqDTO(37.55453208597017, 127.04085637186247),
				new CreateRouteReqDTO(37.554542717893675, 127.04083089088046),
				new CreateRouteReqDTO(37.554553349811684, 127.0408054098912),
				new CreateRouteReqDTO(37.554563981724215, 127.04077992889464)
			);

			Node node1 = NodeFixture.createNode(37.554533318727884, 127.040754103711);
			Node node2 = NodeFixture.createNode(0, 0);
			List<Node> savedNode = nodeRepository.saveAll(List.of(node1, node2));

			routeRepository.save(RouteFixture.createRoute(savedNode.get(0), savedNode.get(1)));

			doNothing().when(mapClient).fetchHeights(anyList());

			// when, then
			Assertions.assertThatThrownBy(() -> mapService.createRoute(1001L, new CreateRoutesReqDTO(savedNode.get(0).getId(), null, requests)))
				.isInstanceOf(RouteCalculationException.class)
				.hasMessageContaining("has duplicate nearest node");
		}

		@Test
		@DisplayName("인접한 노드는 중복될 수 없다. a->b->a 경우 ")
		void nearest_test2(){
			// given
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(37.554533318727884, 127.040754103711),
				new CreateRouteReqDTO(37.554506962309226, 127.0407538544841),
				new CreateRouteReqDTO(37.554480605890554, 127.04075360525738),
				new CreateRouteReqDTO(37.5544542494719, 127.04075335603085),
				new CreateRouteReqDTO(37.554427893053244, 127.04075310680449),

				new CreateRouteReqDTO(37.55437473334863, 127.04076651784956),

				new CreateRouteReqDTO(37.554367645389384, 127.0407906577353),

				new CreateRouteReqDTO(37.55437473334863, 127.04076651784956),

				new CreateRouteReqDTO(37.55436055742524, 127.04081479761643),
				new CreateRouteReqDTO(37.554353469456174, 127.04083893749296),
				new CreateRouteReqDTO(37.55436126622311, 127.04086665364699),
				new CreateRouteReqDTO(37.55436906298358, 127.04089436980678),
				new CreateRouteReqDTO(37.55437685973755, 127.04092208597243),
				new CreateRouteReqDTO(37.55440095878911, 127.04091538046072),
				new CreateRouteReqDTO(37.554425057840305, 127.04090867494469),
				new CreateRouteReqDTO(37.554449156891096, 127.04090196942433),
				new CreateRouteReqDTO(37.55447325594152, 127.04089526389961),
				new CreateRouteReqDTO(37.55449735499156, 127.04088855837058),
				new CreateRouteReqDTO(37.55452145404122, 127.0408818528372),
				new CreateRouteReqDTO(37.55453208597017, 127.04085637186247),
				new CreateRouteReqDTO(37.554542717893675, 127.04083089088046),
				new CreateRouteReqDTO(37.554553349811684, 127.0408054098912),
				new CreateRouteReqDTO(37.554563981724215, 127.04077992889464)
			);

			Node node1 = NodeFixture.createNode(37.554533318727884, 127.040754103711);
			Node node2 = NodeFixture.createNode(0, 0);
			List<Node> savedNode = nodeRepository.saveAll(List.of(node1, node2));

			routeRepository.save(RouteFixture.createRoute(savedNode.get(0), savedNode.get(1)));

			doNothing().when(mapClient).fetchHeights(anyList());

			// when, then
			Assertions.assertThatThrownBy(() -> mapService.createRoute(1001L, new CreateRoutesReqDTO(savedNode.get(0).getId(), null, requests)))
				.isInstanceOf(RouteCalculationException.class)
				.hasMessageContaining("has duplicate nearest node");
		}

		@Test
		@DisplayName("동일한 노드가 2노드 이후에 있을 경우 정상 입력이다. a -> b -> c -> a 경우")
		void nearest_test3(){
			// given
			List<CreateRouteReqDTO> requests = List.of(
				new CreateRouteReqDTO(37.554533318727884, 127.040754103711),
				new CreateRouteReqDTO(37.554506962309226, 127.0407538544841),
				new CreateRouteReqDTO(37.554480605890554, 127.04075360525738),
				new CreateRouteReqDTO(37.5544542494719, 127.04075335603085),
				new CreateRouteReqDTO(37.554427893053244, 127.04075310680449),

				new CreateRouteReqDTO(37.55437473334863, 127.04076651784956),

				new CreateRouteReqDTO(37.554367645389384, 127.0407906577353),
				new CreateRouteReqDTO(37.55436055742524, 127.04081479761643),

				new CreateRouteReqDTO(37.55437473334863, 127.04076651784956),

				new CreateRouteReqDTO(37.554353469456174, 127.04083893749296),
				new CreateRouteReqDTO(37.55436126622311, 127.04086665364699),
				new CreateRouteReqDTO(37.55436906298358, 127.04089436980678),
				new CreateRouteReqDTO(37.55437685973755, 127.04092208597243),
				new CreateRouteReqDTO(37.55440095878911, 127.04091538046072),
				new CreateRouteReqDTO(37.554425057840305, 127.04090867494469),
				new CreateRouteReqDTO(37.554449156891096, 127.04090196942433),
				new CreateRouteReqDTO(37.55447325594152, 127.04089526389961),
				new CreateRouteReqDTO(37.55449735499156, 127.04088855837058),
				new CreateRouteReqDTO(37.55452145404122, 127.0408818528372),
				new CreateRouteReqDTO(37.55453208597017, 127.04085637186247),
				new CreateRouteReqDTO(37.554542717893675, 127.04083089088046),
				new CreateRouteReqDTO(37.554553349811684, 127.0408054098912),
				new CreateRouteReqDTO(37.554563981724215, 127.04077992889464)
			);

			Node node1 = NodeFixture.createNode(37.554533318727884, 127.040754103711);
			Node node2 = NodeFixture.createNode(0, 0);
			List<Node> savedNode = nodeRepository.saveAll(List.of(node1, node2));

			routeRepository.save(RouteFixture.createRoute(savedNode.get(0), savedNode.get(1)));

			doNothing().when(mapClient).fetchHeights(anyList());

			// when
			mapService.createRoute(1001L, new CreateRoutesReqDTO(savedNode.get(0).getId(), null, requests));

			// then
			List<Node> savedNodes = nodeRepository.findAll();

			assertThat(savedNodes).hasSize(23);

			int coreCount = 0;

			for(Node n : savedNodes){
				if(n.isCore()){
					coreCount++;
				}
			}

			assertThat(coreCount).isEqualTo(1);
		}


	}


}
