package com.softeer5.uniro_backend.route.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.route.entity.Route;

public interface RouteRepository extends JpaRepository<Route, Long> {

    @EntityGraph(attributePaths = {"node1", "node2"})
    @Query("SELECT r FROM Route r WHERE r.univId = :univId")
    List<Route> findAllRouteByUnivIdWithNodes(Long univId);

    @Query(value = "SELECT r.* FROM route r " +
            "WHERE r.univ_id = :univId " +
            "AND (r.caution_factors LIKE '[\"%' OR r.danger_factors LIKE '[\"%')",
            nativeQuery = true)
    List<Route> findRiskRouteByUnivId(@Param("univId") Long univId);

    Optional<Route> findByIdAndUnivId (Long id, Long univId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM Route r WHERE r.univId =:univId AND r.createdAt > :versionTimeStamp")
    void deleteAllByCreatedAt(@Param("univId") Long univId, @Param("versionTimeStamp") LocalDateTime versionTimeStamp);

}
