package com.softeer5.uniro_backend.route;

import static org.assertj.core.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.common.exception.custom.SameStartAndEndPointException;
import com.softeer5.uniro_backend.fixture.NodeFixture;
import com.softeer5.uniro_backend.fixture.RouteFixture;
import com.softeer5.uniro_backend.node.entity.Node;
import com.softeer5.uniro_backend.node.repository.NodeRepository;
import com.softeer5.uniro_backend.route.dto.CreateRouteServiceReqDTO;
import com.softeer5.uniro_backend.route.entity.Route;
import com.softeer5.uniro_backend.route.repository.RouteRepository;
import com.softeer5.uniro_backend.route.service.RouteCalculationService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RouteCalculationServiceTest {

	@Autowired
	private RouteCalculationService routeCalculationService;
	@Autowired
	private RouteRepository routeRepository;
	@Autowired
	private NodeRepository nodeRepository;
	@Test
	void 기본_경로_생성() {
		// Given
		Long univId = 1001L;
		List<CreateRouteServiceReqDTO> requests = List.of(
			new CreateRouteServiceReqDTO(0, 0),
			new CreateRouteServiceReqDTO(1, 1),
			new CreateRouteServiceReqDTO(2, 2)
		);

		Node node1 = NodeFixture.createNode(0, 0);
		Node node2 = NodeFixture.createNode(1, 0);
		Route route = RouteFixture.createRoute(node1, node2);

		nodeRepository.saveAll(List.of(node1, node2));
		routeRepository.save(route);

		// When
		List<Node> result = routeCalculationService.checkRouteCross(univId, requests);

		// Then
		assertThat(result).hasSize(3);
		assertThat(result.get(0).isCore()).isTrue();
	}

	@Test
	void 기존_경로와_겹치는_경우_1() {
		// Given
		Long univId = 1001L;
		List<CreateRouteServiceReqDTO> requests = List.of(
			new CreateRouteServiceReqDTO(0, 0),
			new CreateRouteServiceReqDTO(1, 1),
			new CreateRouteServiceReqDTO(2, 2)
		);

		Node node1 = NodeFixture.createNode(0, 0);
		Node node2 = NodeFixture.createNode(1.5, 1.5);
		Route route = RouteFixture.createRoute(node1, node2);

		nodeRepository.saveAll(List.of(node1, node2));
		routeRepository.save(route);

		// When
		List<Node> result = routeCalculationService.checkRouteCross(univId, requests);

		// Then
		assertThat(result).hasSize(5);
		assertThat(result.get(0).isCore()).isTrue();
	}

	@Test
	void 기존_경로와_겹치는_교점이_무한인_경우() {
		// Given
		Long univId = 1001L;
		List<CreateRouteServiceReqDTO> requests = List.of(
			new CreateRouteServiceReqDTO(0, 0),
			new CreateRouteServiceReqDTO(2, 2)
		);

		Node node1 = NodeFixture.createNode(0, 0);
		Node node2 = NodeFixture.createNode(1, 1);
		Route route = RouteFixture.createRoute(node1, node2);

		nodeRepository.saveAll(List.of(node1, node2));
		routeRepository.save(route);

		// When
		List<Node> result = routeCalculationService.checkRouteCross(univId, requests);

		// Then
		assertThat(result).hasSize(2);
		assertThat(result.get(0).isCore()).isTrue();
	}

	@Test
	void 출발점과_도착점이_같은_경우_예외처리() {
		// Given
		Long univId = 1001L;
		List<CreateRouteServiceReqDTO> requests = List.of(
			new CreateRouteServiceReqDTO(0, 0),
			new CreateRouteServiceReqDTO(1, 1),
			new CreateRouteServiceReqDTO(0, 0)
		);

		Node node1 = NodeFixture.createNode(0, 0);
		Node node2 = NodeFixture.createNode(1.5, 1.5);
		Route route = RouteFixture.createRoute(node1, node2);

		nodeRepository.saveAll(List.of(node1, node2));
		routeRepository.save(route);

		// when, Then
		assertThatThrownBy(() -> routeCalculationService.checkRouteCross(univId, requests))
			.isInstanceOf(SameStartAndEndPointException.class);

	}



}
