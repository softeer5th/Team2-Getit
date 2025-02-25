package com.softeer5.uniro_backend.map.service;

import com.softeer5.uniro_backend.building.entity.Building;
import com.softeer5.uniro_backend.building.repository.BuildingRepository;
import com.softeer5.uniro_backend.fixture.NodeFixture;
import com.softeer5.uniro_backend.fixture.RouteFixture;
import com.softeer5.uniro_backend.map.dto.response.FastestRouteResDTO;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.enums.CautionFactor;
import com.softeer5.uniro_backend.map.enums.DangerFactor;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.repository.RouteRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlGroup;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.ArrayList;
import java.util.List;

import static com.softeer5.uniro_backend.common.constant.UniroConst.BUILDING_ROUTE_DISTANCE;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class RouteCalculatorTest {
    @Autowired
    MapService mapService;
    @Autowired
    NodeRepository nodeRepository;
    @Autowired
    BuildingRepository buildingRepository;
    @Autowired
    RouteRepository routeRepository;

    private final double epsilon = 0.0000001;

    @Nested
    @SqlGroup({
            @Sql(value = "/sql/delete-all-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD),
            @Sql(value = "/sql/delete-all-data.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
    })
    class 길찾기 {
        @Test
        void 기본_길찾기() {
            Node n1 = NodeFixture.createNode(0, 0);
            Node n2 = NodeFixture.createNode(0, 0);
            Node n3 = NodeFixture.createNode(0, 0);
            Node n4 = NodeFixture.createNode(0, 0);
            Node n5 = NodeFixture.createNode(0, 0);
            Node n6 = NodeFixture.createNode(0, 0);
            Node n7 = NodeFixture.createNode(0, 0);
            Node n8 = NodeFixture.createNode(0, 0);

            Route r1 = RouteFixture.createRouteWithDistance(n1, n2, BUILDING_ROUTE_DISTANCE);
            Route r2 = RouteFixture.createRouteWithDistance(n2, n3, 15);
            Route r3 = RouteFixture.createRouteWithDistance(n3, n7, 1);
            Route r4 = RouteFixture.createRouteWithDistance(n3, n4, 6);
            Route r5 = RouteFixture.createRouteWithDistance(n4, n5, BUILDING_ROUTE_DISTANCE);
            Route r6 = RouteFixture.createRouteWithDistance(n5, n6, BUILDING_ROUTE_DISTANCE);
            Route r7 = RouteFixture.createRouteWithDistance(n6, n7, 18);
            Route r8 = RouteFixture.createRouteWithDistance(n7, n8, 3);
            Route r9 = RouteFixture.createRouteWithDistance(n8, n1, BUILDING_ROUTE_DISTANCE);

            Building b1 = Building.builder().nodeId(1L).univId(1001L).build();
            Building b5 = Building.builder().nodeId(5L).univId(1001L).build();

            nodeRepository.saveAll(List.of(n1, n2, n3, n4, n5, n6, n7, n8));
            routeRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8, r9));
            buildingRepository.saveAll(List.of(b1, b5));

            List<FastestRouteResDTO> fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);


            //a. distance 확안

            //a-1. 보도, 휠체어안전, 휠체어위험 모두 가능한지?
            assertThat(fastestRoute).hasSize(3);

            //a-2. distance가 정상적으로 제공되는지?
            double distance0 = fastestRoute.get(0).getTotalDistance();
            assertThat(Math.abs(distance0 - 10.0)).isLessThan(epsilon);
            double distance1 = fastestRoute.get(1).getTotalDistance();
            assertThat(Math.abs(distance1 - 10.0)).isLessThan(epsilon);
            double distance2 = fastestRoute.get(2).getTotalDistance();
            assertThat(Math.abs(distance2 - 10.0)).isLessThan(epsilon);

            //b. cost 확인

            //b.1- PEDES일때 휠체어, 전동휠체어의 cost가 정상적으로 null이 나왔는지?
            assertThat(fastestRoute.get(0).getElectricTotalCost()).isNull();
            assertThat(fastestRoute.get(0).getManualTotalCost()).isNull();

            //b-2- WHEEL_FAST, WHEEL_SAFE일 때 도보의 cost가 정상적으로 null이 나왔는지?
            assertThat(fastestRoute.get(1).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(1).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(2).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(2).getPedestrianTotalCost()).isNull();

        }

        @Test
        void 주의요소가_포함된_길찾기() {
            Node n1 = NodeFixture.createNode(0, 0);
            Node n2 = NodeFixture.createNode(0, 0);
            Node n3 = NodeFixture.createNode(0, 0);
            Node n4 = NodeFixture.createNode(0, 0);
            Node n5 = NodeFixture.createNode(0, 0);
            Node n6 = NodeFixture.createNode(0, 0);
            Node n7 = NodeFixture.createNode(0, 0);
            Node n8 = NodeFixture.createNode(0, 0);

            Route r1 = RouteFixture.createRouteWithDistance(n1, n2, BUILDING_ROUTE_DISTANCE);
            Route r2 = RouteFixture.createRouteWithDistance(n2, n3, 14);
            Route r3 = RouteFixture.createRouteWithDistance(n3, n7, 1);
            Route r4 = RouteFixture.createRouteWithDistance(n3, n4, 6);
            Route r5 = RouteFixture.createRouteWithDistance(n4, n5, BUILDING_ROUTE_DISTANCE);
            Route r6 = RouteFixture.createRouteWithDistance(n5, n6, BUILDING_ROUTE_DISTANCE);
            Route r7 = RouteFixture.createRouteWithDistance(n6, n7, 18);
            Route r8 = RouteFixture.createRouteWithDistance(n7, n8, 3);
            Route r9 = RouteFixture.createRouteWithDistance(n8, n1, BUILDING_ROUTE_DISTANCE);

            Building b1 = Building.builder().nodeId(1L).univId(1001L).build();
            Building b5 = Building.builder().nodeId(5L).univId(1001L).build();

            List<CautionFactor> cautionFactorsList = new ArrayList<>();
            cautionFactorsList.add(CautionFactor.CRACK);
            r3.setCautionFactorsByList(cautionFactorsList);

            nodeRepository.saveAll(List.of(n1, n2, n3, n4, n5, n6, n7, n8));
            routeRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8, r9));
            buildingRepository.saveAll(List.of(b1, b5));

            List<FastestRouteResDTO> fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);

            //a. distance 확안

            //a-1. 보도, 휠체어위험 모두 가능한지?
            assertThat(fastestRoute).hasSize(3);

            //a-2. distance가 정상적으로 제공되는지?
            double distance0 = fastestRoute.get(0).getTotalDistance();
            assertThat(Math.abs(distance0 - 10.0)).isLessThan(epsilon);
            double distance1 = fastestRoute.get(1).getTotalDistance();
            assertThat(Math.abs(distance1 - 10.0)).isLessThan(epsilon);
            double distance2 = fastestRoute.get(2).getTotalDistance();
            assertThat(Math.abs(distance2 - 20.0)).isLessThan(epsilon);

            //b. cost 확인

            //b.1- PEDES일때 휠체어, 전동휠체어의 cost가 정상적으로 null이 나왔는지?
            assertThat(fastestRoute.get(0).getElectricTotalCost()).isNull();
            assertThat(fastestRoute.get(0).getManualTotalCost()).isNull();

            //b-2- WHEEL_FAST, WHEEL_SAFE일 때 도보의 cost가 정상적으로 null이 나왔는지?
            assertThat(fastestRoute.get(1).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(1).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(2).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(2).getPedestrianTotalCost()).isNull();

        }

        @Test
        void 위험요소가_포함된_길찾기() {
            Node n1 = NodeFixture.createNode(0, 0);
            Node n2 = NodeFixture.createNode(0, 0);
            Node n3 = NodeFixture.createNode(0, 0);
            Node n4 = NodeFixture.createNode(0, 0);
            Node n5 = NodeFixture.createNode(0, 0);
            Node n6 = NodeFixture.createNode(0, 0);
            Node n7 = NodeFixture.createNode(0, 0);
            Node n8 = NodeFixture.createNode(0, 0);

            Route r1 = RouteFixture.createRouteWithDistance(n1, n2, BUILDING_ROUTE_DISTANCE);
            Route r2 = RouteFixture.createRouteWithDistance(n2, n3, 15);
            Route r3 = RouteFixture.createRouteWithDistance(n3, n7, 1);
            Route r4 = RouteFixture.createRouteWithDistance(n3, n4, 6);
            Route r5 = RouteFixture.createRouteWithDistance(n4, n5, BUILDING_ROUTE_DISTANCE);
            Route r6 = RouteFixture.createRouteWithDistance(n5, n6, BUILDING_ROUTE_DISTANCE);
            Route r7 = RouteFixture.createRouteWithDistance(n6, n7, 18);
            Route r8 = RouteFixture.createRouteWithDistance(n7, n8, 3);
            Route r9 = RouteFixture.createRouteWithDistance(n8, n1, BUILDING_ROUTE_DISTANCE);

            Building b1 = Building.builder().nodeId(1L).univId(1001L).build();
            Building b5 = Building.builder().nodeId(5L).univId(1001L).build();

            List<DangerFactor> dangerFactorsList = new ArrayList<>();
            dangerFactorsList.add(DangerFactor.ETC);
            r2.setDangerFactorsByList(dangerFactorsList);
            r4.setDangerFactorsByList(dangerFactorsList);

            nodeRepository.saveAll(List.of(n1, n2, n3, n4, n5, n6, n7, n8));
            routeRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8, r9));
            buildingRepository.saveAll(List.of(b1, b5));

            List<FastestRouteResDTO> fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);


            //a. distance 확안

            //a-1. 보도, 휠체어 위험으로 가능한지?
            assertThat(fastestRoute).hasSize(3);

            //a-2. distance가 정상적으로 제공되는지?
            double distance0 = fastestRoute.get(0).getTotalDistance();
            assertThat(Math.abs(distance0 - 10.0)).isLessThan(epsilon);
            double distance1 = fastestRoute.get(1).getTotalDistance();
            assertThat(Math.abs(distance1 - 21.0)).isLessThan(epsilon);
            double distance2 = fastestRoute.get(2).getTotalDistance();
            assertThat(Math.abs(distance2 - 21.0)).isLessThan(epsilon);

            //b. cost 확인

            //b.1- PEDES일때 휠체어, 전동휠체어의 cost가 정상적으로 null이 나왔는지?
            assertThat(fastestRoute.get(0).getElectricTotalCost()).isNull();
            assertThat(fastestRoute.get(0).getManualTotalCost()).isNull();

            //b-2- WHEEL_FAST일 때 도보의 cost가 정상적으로 null이 나왔는지?
            assertThat(fastestRoute.get(1).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(1).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(2).getPedestrianTotalCost()).isNull();
            assertThat(fastestRoute.get(2).getPedestrianTotalCost()).isNull();

        }

        @Test
        void 위험요소를_지나지_않으면_도착할_수_없는_길찾기() {
            Node n1 = NodeFixture.createNode(0, 0);
            Node n2 = NodeFixture.createNode(0, 0);
            Node n3 = NodeFixture.createNode(0, 0);
            Node n4 = NodeFixture.createNode(0, 0);
            Node n5 = NodeFixture.createNode(0, 0);
            Node n6 = NodeFixture.createNode(0, 0);
            Node n7 = NodeFixture.createNode(0, 0);
            Node n8 = NodeFixture.createNode(0, 0);

            Route r1 = RouteFixture.createRouteWithDistance(n1, n2, BUILDING_ROUTE_DISTANCE);
            Route r2 = RouteFixture.createRouteWithDistance(n2, n3, 15);
            Route r3 = RouteFixture.createRouteWithDistance(n3, n7, 1);
            Route r4 = RouteFixture.createRouteWithDistance(n3, n4, 6);
            Route r5 = RouteFixture.createRouteWithDistance(n4, n5, BUILDING_ROUTE_DISTANCE);
            Route r6 = RouteFixture.createRouteWithDistance(n5, n6, BUILDING_ROUTE_DISTANCE);
            Route r7 = RouteFixture.createRouteWithDistance(n6, n7, 18);
            Route r8 = RouteFixture.createRouteWithDistance(n7, n8, 3);
            Route r9 = RouteFixture.createRouteWithDistance(n8, n1, BUILDING_ROUTE_DISTANCE);

            Building b1 = Building.builder().nodeId(1L).univId(1001L).build();
            Building b5 = Building.builder().nodeId(5L).univId(1001L).build();

            List<DangerFactor> dangerFactorsList = new ArrayList<>();
            dangerFactorsList.add(DangerFactor.ETC);
            r2.setDangerFactorsByList(dangerFactorsList);
            r8.setDangerFactorsByList(dangerFactorsList);

            nodeRepository.saveAll(List.of(n1, n2, n3, n4, n5, n6, n7, n8));
            routeRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8, r9));
            buildingRepository.saveAll(List.of(b1, b5));

            List<FastestRouteResDTO> fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);

            //a. distance 확안

            //a-1. 보도로 가능한지?

            assertThat(fastestRoute).hasSize(1);

            double distance0 = fastestRoute.get(0).getTotalDistance();
            assertThat(Math.abs(distance0 - 10.0)).isLessThan(epsilon);

        }

        @Test
        void 기본_길찾기_높이고려_휴리스틱() {
            Node n1 = NodeFixture.createNodeWithHeight(0, 0, 10);
            Node n2 = NodeFixture.createNodeWithHeight(0, 0, 10);
            Node n3 = NodeFixture.createNodeWithHeight(0, 0, 1000);
            Node n4 = NodeFixture.createNodeWithHeight(0, 0, 10);
            Node n5 = NodeFixture.createNodeWithHeight(0, 0, 10);
            Node n6 = NodeFixture.createNodeWithHeight(0, 0, 10);
            Node n7 = NodeFixture.createNodeWithHeight(0, 0, 10);
            Node n8 = NodeFixture.createNodeWithHeight(0, 0, 10);

            Route r1 = RouteFixture.createRouteWithDistance(n1, n2, BUILDING_ROUTE_DISTANCE);
            Route r2 = RouteFixture.createRouteWithDistance(n2, n3, 10);
            Route r4 = RouteFixture.createRouteWithDistance(n3, n4, 6);
            Route r5 = RouteFixture.createRouteWithDistance(n4, n5, BUILDING_ROUTE_DISTANCE);
            Route r6 = RouteFixture.createRouteWithDistance(n5, n6, BUILDING_ROUTE_DISTANCE);
            Route r7 = RouteFixture.createRouteWithDistance(n6, n7, 18);
            Route r8 = RouteFixture.createRouteWithDistance(n7, n8, 3);
            Route r9 = RouteFixture.createRouteWithDistance(n8, n1, BUILDING_ROUTE_DISTANCE);

            Building b1 = Building.builder().nodeId(1L).univId(1001L).build();
            Building b5 = Building.builder().nodeId(5L).univId(1001L).build();

            nodeRepository.saveAll(List.of(n1, n2, n3, n4, n5, n6, n7, n8));
            routeRepository.saveAll(List.of(r1, r2, r4, r5, r6, r7, r8, r9));
            buildingRepository.saveAll(List.of(b1, b5));

            List<FastestRouteResDTO> fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);


            //a. distance 확안

            //a-1. 보도, 휠체어안전, 휠체어위험 모두 가능한지?
            assertThat(fastestRoute).hasSize(3);

            //a-2. distance가 정상적으로 제공되는지?
            double distance0 = fastestRoute.get(0).getTotalDistance();
            assertThat(Math.abs(distance0 - 16.0)).isLessThan(epsilon);

        }

        @Test
        void 주의요소가_포함된_길찾기_위험요소고려_휴리스틱() {
            Node n1 = NodeFixture.createNode(0, 0);
            Node n2 = NodeFixture.createNode(0, 0);
            Node n3 = NodeFixture.createNode(0, 0);
            Node n4 = NodeFixture.createNode(0, 0);
            Node n5 = NodeFixture.createNode(0, 0);
            Node n6 = NodeFixture.createNode(0, 0);
            Node n7 = NodeFixture.createNode(0, 0);
            Node n8 = NodeFixture.createNode(0, 0);

            Route r1 = RouteFixture.createRouteWithDistance(n1, n2, BUILDING_ROUTE_DISTANCE);
            Route r2 = RouteFixture.createRouteWithDistance(n2, n3, 14);
            Route r4 = RouteFixture.createRouteWithDistance(n3, n4, 6);
            Route r5 = RouteFixture.createRouteWithDistance(n4, n5, BUILDING_ROUTE_DISTANCE);
            Route r6 = RouteFixture.createRouteWithDistance(n5, n6, BUILDING_ROUTE_DISTANCE);
            Route r7 = RouteFixture.createRouteWithDistance(n6, n7, 18);
            Route r8 = RouteFixture.createRouteWithDistance(n7, n8, 3);
            Route r9 = RouteFixture.createRouteWithDistance(n8, n1, BUILDING_ROUTE_DISTANCE);

            Building b1 = Building.builder().nodeId(1L).univId(1001L).build();
            Building b5 = Building.builder().nodeId(5L).univId(1001L).build();

            List<CautionFactor> cautionFactorsList = new ArrayList<>();
            cautionFactorsList.add(CautionFactor.CRACK);
            r2.setCautionFactorsByList(cautionFactorsList);
            r4.setCautionFactorsByList(cautionFactorsList);

            nodeRepository.saveAll(List.of(n1, n2, n3, n4, n5, n6, n7, n8));
            routeRepository.saveAll(List.of(r1, r2, r4, r5, r6, r7, r8, r9));
            buildingRepository.saveAll(List.of(b1, b5));

            List<FastestRouteResDTO> fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);

            //a. distance 확안

            //a-1. 보도, 휠체어위험 모두 가능한지?
            assertThat(fastestRoute).hasSize(3);

            //a-2. distance가 정상적으로 제공되는지?
            double distance0 = fastestRoute.get(0).getTotalDistance();
            assertThat(Math.abs(distance0 - 20.0)).isLessThan(epsilon);
            double distance1 = fastestRoute.get(1).getTotalDistance();
            assertThat(Math.abs(distance1 - 21.0)).isLessThan(epsilon);
            double distance2 = fastestRoute.get(2).getTotalDistance();
            assertThat(Math.abs(distance2 - 21.0)).isLessThan(epsilon);
        }

    }


}