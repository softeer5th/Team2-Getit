package com.softeer5.uniro_backend.node.repository;

import com.softeer5.uniro_backend.node.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;


public interface NodeRepository extends JpaRepository<Node, Long> {
}
