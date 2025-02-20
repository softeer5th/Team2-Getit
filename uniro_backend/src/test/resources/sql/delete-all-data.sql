-- 외래 키 제약 조건 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 모든 데이터 삭제
DELETE FROM `uniro-test`.building;
DELETE FROM `uniro-test`.node;
DELETE FROM `uniro-test`.rev_info;
DELETE FROM `uniro-test`.node_aud;
DELETE FROM `uniro-test`.route;
DELETE FROM `uniro-test`.route_aud;
DELETE FROM `uniro-test`.univ;

-- AUTO_INCREMENT 시퀀스 초기화
ALTER TABLE `uniro-test`.building AUTO_INCREMENT = 1;
ALTER TABLE `uniro-test`.node AUTO_INCREMENT = 1;
ALTER TABLE `uniro-test`.rev_info AUTO_INCREMENT = 1;
ALTER TABLE `uniro-test`.route AUTO_INCREMENT = 1;
ALTER TABLE `uniro-test`.univ AUTO_INCREMENT = 1;
ALTER TABLE `uniro-test`.route_aud AUTO_INCREMENT = 1;
ALTER TABLE `uniro-test`.node_aud AUTO_INCREMENT = 1;

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

-- 외래 키 제약 조건 활성화
SET FOREIGN_KEY_CHECKS = 1;
