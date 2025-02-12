package com.softeer5.uniro_backend.building.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.softeer5.uniro_backend.building.service.vo.BuildingNode;
import com.softeer5.uniro_backend.building.entity.Building;

public interface BuildingRepository extends JpaRepository<Building, Long>, BuildingCustomRepository {

	// 추후에 인덱싱 작업 필요.
	@Query("""
        SELECT new com.softeer5.uniro_backend.building.service.vo.BuildingNode(b, n)
        FROM Building b 
        JOIN FETCH Node n ON b.nodeId = n.id
        WHERE b.univId = :univId 
        AND b.level >= :level
        AND ST_Within(n.coordinates, ST_PolygonFromText((:polygon),4326))
    """)
	List<BuildingNode> findByUnivIdAndLevelWithNode(Long univId, int level, String polygon);

	@Query("""
        SELECT new com.softeer5.uniro_backend.building.service.vo.BuildingNode(b, n)
        FROM Building b 
        JOIN FETCH Node n ON b.nodeId = n.id
        WHERE b.nodeId = :nodeId
    """)
	Optional<BuildingNode> findByNodeIdWithNode(Long nodeId);

	List<Building> findAllByNodeIdIn(List<Long> nodeIds);

	boolean existsByNodeIdAndUnivId(Long nodeId, Long univId);
}
