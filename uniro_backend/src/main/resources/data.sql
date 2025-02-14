INSERT INTO
    node (id, coordinates, height, is_core, univ_id)
VALUES
    (1, ST_PointFromText('POINT(30.001 37.001)', 4326), 50.0, TRUE, 1001),
    (2, ST_PointFromText('POINT(30.002 37.002)', 4326), 52.3, FALSE, 1001),
    (3, ST_PointFromText('POINT(30.003 37.003)', 4326), 55.1, FALSE, 1001),
    (4, ST_PointFromText('POINT(30.004 37.004)', 4326), 49.8, TRUE, 1002),
    (5, ST_PointFromText('POINT(30.005 37.005)', 4326), 51.0, FALSE, 1002),
    (6, ST_PointFromText('POINT(30.006 37.006)', 4326), 48.5, FALSE, 1003);


-- 목 데이터 삽입
INSERT INTO
    route (id, distance, path, node1_id, node2_id, univ_id, core_route_id, caution_factors, danger_factors)
VALUES
    (1, 10.5, ST_GeomFromText('LINESTRING(30.001 37.001, 30.002 37.002)', 4326), 1, 2, 1001, NULL, '["SLOPE", "CURB"]', '["STAIRS"]'),
    (2, 20.0, ST_GeomFromText('LINESTRING(30.002 37.002, 30.003 37.003)', 4326), 2, 3, 1001, NULL, '["CRACK"]', '["SLOPE", "STAIRS"]'),
    (3, 15.2, ST_GeomFromText('LINESTRING(30.003 37.003, 30.004 37.004)', 4326), 3, 4, 1002, 1, '["SLOPE", "CURB"]', '["SLOPE", "STAIRS"]'),
    (4, 25.7, ST_GeomFromText('LINESTRING(30.004 37.004, 30.005 37.005)', 4326), 4, 5, 1002, 1, '["CURB", "CRACK"]', '[]'),
    (5, 30.0, ST_GeomFromText('LINESTRING(30.005 37.005, 30.006 37.006)', 4326), 5, 6, 1003, NULL, '[]', '["CURB"]');

INSERT INTO
    building (id, phone_number, address, name, image_url, level, node_id, univ_id)
VALUES
    (1, '010-1234-5678', '123 Main St', '공학관', 'http://example.com/image1.jpg', 5, 1, 1001),
    (2, '010-2345-6789', '456 Maple Ave', '인문관', 'http://example.com/image2.jpg', 3, 2, 1001),
    (3, '010-3456-7890', '789 Oak St', '소프트웨어융합관', 'http://example.com/image3.jpg', 1, 3, 1001),
    (4, '010-4567-8901', '101 Pine St', '공대관', 'http://example.com/image4.jpg', 4, 4, 1002),
    (5, '010-5678-9012', '202 Cedar Rd', '예술관', 'http://example.com/image5.jpg', 2, 5, 1002),
    (6, '010-6789-0123', '303 Birch Ln', '강당', 'http://example.com/image6.jpg', 2, 6, 1003);
