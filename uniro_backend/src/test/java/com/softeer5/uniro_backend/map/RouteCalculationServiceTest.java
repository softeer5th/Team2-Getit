package com.softeer5.uniro_backend.map;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.softeer5.uniro_backend.common.exception.custom.RouteCalculationException;
import com.softeer5.uniro_backend.fixture.NodeFixture;
import com.softeer5.uniro_backend.fixture.RouteFixture;
import com.softeer5.uniro_backend.map.dto.request.CreateRoutesReqDTO;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.dto.request.CreateRouteReqDTO;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.repository.RouteRepository;
import com.softeer5.uniro_backend.map.service.MapService;
import com.softeer5.uniro_backend.map.service.RouteCalculator;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class RouteCalculationServiceTest {

	@Autowired
	private RouteCalculator routeCalculator;
	@Autowired
	private MapService mapService;
	@Autowired
	private RouteRepository routeRepository;
	@Autowired
	private NodeRepository nodeRepository;

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

	}


}
