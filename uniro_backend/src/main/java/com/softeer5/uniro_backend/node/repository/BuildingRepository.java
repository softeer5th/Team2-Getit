package com.softeer5.uniro_backend.node.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.softeer5.uniro_backend.node.dto.BuildingNode;
import com.softeer5.uniro_backend.node.entity.Building;

public interface BuildingRepository extends JpaRepository<Building, Long>, BuildingCustomRepository {

	// 추후에 인덱싱 작업 필요.
	@Query("""
        SELECT new com.softeer5.uniro_backend.node.dto.BuildingNode(b, n)
        FROM Building b 
        JOIN FETCH Node n ON b.nodeId = n.id
        WHERE b.univId = :univId 
        AND b.level >= :level
        AND ST_Within(n.coordinates, ST_MakeEnvelope(:lux, :luy, :rdx, :rdy, 4326))
    """)
	List<BuildingNode> findByUnivIdAndLevelWithNode(Long univId, int level, double lux , double luy, double rdx , double rdy);

	@Query("""
        SELECT new com.softeer5.uniro_backend.node.dto.BuildingNode(b, n)
        FROM Building b 
        JOIN FETCH Node n ON b.nodeId = n.id
        WHERE b.nodeId = :nodeId
    """)
	Optional<BuildingNode> findByNodeIdWithNode(Long nodeId);
}
