INSERT INTO
    node (id, coordinates, height, is_core, univ_id)
VALUES
    (1, ST_PointFromText('POINT(127.001 37.001)', 4326), 50.0, TRUE, 1001),
    (2, ST_PointFromText('POINT(127.002 37.002)', 4326), 52.3, FALSE, 1001),
    (3, ST_PointFromText('POINT(127.003 37.003)', 4326), 55.1, FALSE, 1001),
    (4, ST_PointFromText('POINT(127.004 37.004)', 4326), 49.8, TRUE, 1002),
    (5, ST_PointFromText('POINT(127.005 37.005)', 4326), 51.0, FALSE, 1002),
    (6, ST_PointFromText('POINT(127.006 37.006)', 4326), 48.5, FALSE, 1003);


-- 목 데이터 삽입
INSERT INTO
    route (id, cost, path, node1_id, node2_id, univ_id, core_route_id, caution_factors, danger_factors)
VALUES
    (1, 10.5, ST_GeomFromText('LINESTRING(127.001 37.001, 127.002 37.002)', 4326), 1, 2, 1001, NULL, '["SLOPE", "CURB"]', '["STAIRS"]'),
    (2, 20.0, ST_GeomFromText('LINESTRING(127.002 37.002, 127.003 37.003)', 4326), 2, 3, 1001, NULL, '["CRACK"]', '["SLOPE", "STAIRS"]'),
    (3, 15.2, ST_GeomFromText('LINESTRING(127.003 37.003, 127.004 37.004)', 4326), 3, 4, 1002, 1, NULL, NULL),
    (4, 25.7, ST_GeomFromText('LINESTRING(127.004 37.004, 127.005 37.005)', 4326), 4, 5, 1002, 1, '["CURB", "CRACK"]', NULL),
    (5, 30.0, ST_GeomFromText('LINESTRING(127.005 37.005, 127.006 37.006)', 4326), 5, 6, 1003, NULL, NULL, '["CURB"]');
