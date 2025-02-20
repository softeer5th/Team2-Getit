package com.softeer5.uniro_backend.map.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.softeer5.uniro_backend.map.entity.Route;

import static com.softeer5.uniro_backend.common.constant.UniroConst.STREAM_FETCH_SIZE_AS_STRING;

public interface RouteRepository extends JpaRepository<Route, Long> {

    @EntityGraph(attributePaths = {"node1", "node2"})
    @Query("SELECT r FROM Route r WHERE r.univId = :univId")
    List<Route> findAllRouteByUnivIdWithNodes(Long univId);

    @EntityGraph(attributePaths = {"node1", "node2"})
    @Query("SELECT r FROM Route r WHERE r.univId = :univId")
    @QueryHints(@QueryHint(name = "org.hibernate.fetchSize", value = STREAM_FETCH_SIZE_AS_STRING))
    Stream<Route> findAllRouteByUnivIdWithNodesStream(Long univId);

    @Query(value = "SELECT r.* FROM route r " +
            "WHERE r.univ_id = :univId " +
            "AND (r.caution_factors LIKE '[\"%' OR r.danger_factors LIKE '[\"%')",
            nativeQuery = true)
    List<Route> findRiskRouteByUnivId(@Param("univId") Long univId);

    @Query(value = """
    SELECT r.* FROM route r
    JOIN node n1 ON r.node1_id = n1.id
    JOIN node n2 ON r.node2_id = n2.id
    WHERE r.univ_id = :univId
      AND (
        (n1.coordinates = ST_SRID(ST_GeomFromText(:point1), 4326)
        AND n2.coordinates = ST_SRID(ST_GeomFromText(:point2), 4326))
        OR
        (n1.coordinates = ST_SRID(ST_GeomFromText(:point2), 4326)
        AND n2.coordinates = ST_SRID(ST_GeomFromText(:point1), 4326))
      )
    """, nativeQuery = true)
    Optional<Route> findRouteByPointsAndUnivId(
            @Param("univId") Long univId,
            @Param("point1") String point1,
            @Param("point2") String point2
    );

    @Query(value = """
    SELECT r.* FROM route r
    WHERE r.univ_id = :univId
    AND (
        r.path = ST_SRID(ST_GeomFromText(:path), 4326)
        OR
        r.path = ST_SRID(ST_GeomFromText(:rev_path), 4326)
    )
""", nativeQuery = true)
    Optional<Route> findRouteByLineStringAndUnivId(@Param("univId") Long univId,
                                                    @Param("path")String path,
                                                    @Param("rev_path")String revPath);

    Optional<Route> findByIdAndUnivId (Long id, Long univId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM Route r WHERE r.univId =:univId AND r.createdAt > :versionTimeStamp")
    void deleteAllByCreatedAt(@Param("univId") Long univId, @Param("versionTimeStamp") LocalDateTime versionTimeStamp);

    @Query(value = """
    SELECT COUNT(*) FROM Route r
    WHERE r.univId = :univId
    AND (
        r.node1.id = :nodeId
        OR 
        r.node2.id = :nodeId
    )
            """)
    int countByUnivIdAndNodeId(Long univId, Long nodeId);

}
