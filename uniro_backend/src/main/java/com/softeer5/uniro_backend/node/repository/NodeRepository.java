package com.softeer5.uniro_backend.node.repository;

import com.softeer5.uniro_backend.node.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


public interface NodeRepository extends JpaRepository<Node, Long> {

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM Node n WHERE n.univId = :univId AND n.createdAt > :versionTimeStamp")
    void deleteAllByCreatedAt(Long univId, LocalDateTime versionTimeStamp);
}
