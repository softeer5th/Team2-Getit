package com.softeer5.uniro_backend.node.repository;

import com.softeer5.uniro_backend.node.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface NodeRepository extends JpaRepository<Node, Long> {

    Optional<Node> findByIdAndUnivId(Long id, Long univId);
}
