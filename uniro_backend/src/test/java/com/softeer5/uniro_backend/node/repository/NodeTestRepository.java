package com.softeer5.uniro_backend.node.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.softeer5.uniro_backend.node.entity.Node;

public interface NodeTestRepository extends JpaRepository<Node, Long> {
	List<Node> findAllByCreatedAtAfter(LocalDateTime localDateTime);
}
