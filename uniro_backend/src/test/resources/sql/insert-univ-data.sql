INSERT INTO univ
(id, name, trimmed_name, image_url, center_point, left_top_point, right_bottom_point, area_polygon, limit_version)
VALUES
    (
        1001,
        'HYUNIV',
        'HYUNIV',
        'http://example.com/hanyang.jpg',
        ST_GeomFromText('POINT(126.9780 37.5665)', 4326),
        ST_GeomFromText('POINT(126.9720 37.5700)', 4326),
        ST_GeomFromText('POINT(126.9850 37.5620)', 4326),
        ST_GeomFromText('POLYGON((126.9720 37.5700, 126.9850 37.5700, 126.9850 37.5620, 126.9720 37.5620, 126.9720 37.5700))', 4326),
        0
    );