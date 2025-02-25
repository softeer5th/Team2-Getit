package com.softeer5.uniro_backend.external;

import com.softeer5.uniro_backend.external.elevation.MapClientImpl;
import com.softeer5.uniro_backend.common.exception.custom.ElevationApiException;
import com.softeer5.uniro_backend.map.entity.Node;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class MapClientImplTest {
    @Autowired
    private MapClientImpl mapClientImpl;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    @Test
    @DisplayName("Google Elevation API 테스트")
    public void testFetchHeights() {
        Point p1 = geometryFactory.createPoint(new Coordinate(-122.4194, 37.7749));
        Point p2 = geometryFactory.createPoint(new Coordinate(-74.0060, 40.7128));
        Point p3 = geometryFactory.createPoint(new Coordinate(126.9780, 37.5665));

        Node node1 = Node.builder().build();
        node1.setCoordinates(p1);

        Node node2 = Node.builder().build();
        node2.setCoordinates(p2);

        Node node3 = Node.builder().build();
        node3.setCoordinates(p3);

        List<Node> nodes = List.of(node1, node2, node3);

        mapClientImpl.fetchHeights(nodes);

        for (Node node : nodes) {
            assertThat(node.getHeight()).isNotNull();
            System.out.println("Node coordinates: " + node.getCoordinates() + ", Elevation: " + node.getHeight());
        }
    }


    @Test
    @DisplayName("Google Elevation API exception 발생 테스트")
    public void testFetchHeights2() {
        Point p1 = geometryFactory.createPoint(new Coordinate(-122.4194, 37.7749));
        Point p2 = geometryFactory.createPoint(new Coordinate(-74.0060, 40.7128));
        Point p3 = geometryFactory.createPoint(new Coordinate(126.9780, 37.5665));

        Node node1 = Node.builder().build();
        node1.setCoordinates(p1);

        Node node2 = Node.builder().build();
        node2.setCoordinates(p2);

        Node node3 = Node.builder().build();
        node3.setCoordinates(p3);

        List<Node> nodes = List.of(node1, node2, node3);

        // 강제로 @Value로 가져온 Google API Key를 초기화 할 수 있도록 새로운 객체 생성
        mapClientImpl = new MapClientImpl();
        //mapClientImpl.fetchHeights(nodes);
        try {
            mapClientImpl.fetchHeights(nodes);
            Assertions.fail("예외가 발생하지 않았습니다. 예상된 ElevationApiException이 발생해야 합니다.");
        } catch (ElevationApiException e) {
            System.out.println("예외 발생 메시지: " + e.getMessage());
            assertThat(e.getMessage()).contains("Google Elevation API Fail");
        }

        for (Node node : nodes) {
            assertThat(node.getHeight()).isNotNull();
            System.out.println("Node coordinates: " + node.getCoordinates() + ", Elevation: " + node.getHeight());
        }
    }

}