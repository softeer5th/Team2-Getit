package com.softeer5.uniro_backend.node.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.softeer5.uniro_backend.node.dto.BuildingNode;
import com.softeer5.uniro_backend.node.entity.Building;

public interface BuildingRepository extends JpaRepository<Building, Long> {

	@Query("""
        SELECT new com.softeer5.uniro_backend.node.dto.BuildingNode(b, n)
        FROM Building b 
        JOIN FETCH Node n ON b.nodeId = n.id
        AND b.univId = :univId 
        AND b.level >= :level
    """)
	List<BuildingNode> findByUnivIdAndLevelWithNode(Long univId, int level);
}
