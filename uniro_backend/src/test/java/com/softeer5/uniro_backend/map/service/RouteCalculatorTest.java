package com.softeer5.uniro_backend.map.service;

import com.softeer5.uniro_backend.building.entity.Building;
import com.softeer5.uniro_backend.building.repository.BuildingRepository;
import com.softeer5.uniro_backend.fixture.NodeFixture;
import com.softeer5.uniro_backend.fixture.RouteFixture;
import com.softeer5.uniro_backend.map.dto.response.FastestRouteResDTO;
import com.softeer5.uniro_backend.map.entity.CautionFactor;
import com.softeer5.uniro_backend.map.entity.DangerFactor;
import com.softeer5.uniro_backend.map.entity.Node;
import com.softeer5.uniro_backend.map.entity.Route;
import com.softeer5.uniro_backend.map.repository.NodeRepository;
import com.softeer5.uniro_backend.map.repository.RouteRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.ArrayList;
import java.util.List;

import static com.softeer5.uniro_backend.common.constant.UniroConst.BUILDING_ROUTE_DISTANCE;

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


    @Nested
    class 경로추가 {
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

            System.out.println("########## 기본 #############");
            List<FastestRouteResDTO> fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);

            for (FastestRouteResDTO f : fastestRoute) {
                printFastestRouteResDTO(f);
            }

            System.out.println("########## 주의요소 추가 #############");
            List<CautionFactor> cautionFactorsList = new ArrayList<>();
            cautionFactorsList.add(CautionFactor.CRACK);
            r3.setCautionFactorsByList(cautionFactorsList);

            routeRepository.save(r3);

            fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);

            for (FastestRouteResDTO f : fastestRoute) {
                printFastestRouteResDTO(f);
            }

            System.out.println("########## 위험요소 추가 #############");

            List<DangerFactor> dangerFactorsList = new ArrayList<>();
            dangerFactorsList.add(DangerFactor.ETC);
            r6.setDangerFactorsByList(dangerFactorsList);
            r2.setDangerFactorsByList(dangerFactorsList);

            routeRepository.save(r6);

            fastestRoute = mapService.findFastestRoute(1001L, 1L, 5L);

            for (FastestRouteResDTO f : fastestRoute) {
                printFastestRouteResDTO(f);
            }

        }
    }

    public static void printFastestRouteResDTO(FastestRouteResDTO dto) {
        System.out.println("--------------------------------------------------");
        System.out.println("Route Type           : " + dto.getRouteType());
        System.out.println("Has Caution          : " + dto.isHasCaution());
        System.out.println("Total Distance       : " + dto.getTotalDistance());
        System.out.println("Pedestrian Total Cost: " + dto.getPedestrianTotalCost());
        System.out.println("Manual Total Cost    : " + dto.getManualTotalCost());
        System.out.println("Electric Total Cost  : " + dto.getElectricTotalCost());

        System.out.println("--------------------------------------------------");
    }

}