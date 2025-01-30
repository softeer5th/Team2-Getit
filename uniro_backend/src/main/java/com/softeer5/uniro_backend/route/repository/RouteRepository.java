package com.softeer5.uniro_backend.route.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.softeer5.uniro_backend.route.entity.Route;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {

    @EntityGraph(attributePaths = {"node1", "node2"})
    @Query("SELECT r FROM Route r WHERE r.univId = :univId")
    List<Route> findAllRouteByUnivIdWithNodes(Long univId);

    @Query("SELECT r "
            + "FROM Route r "
            + "JOIN FETCH r.node1 n1 "
            + "JOIN FETCH r.node2 n2 "
            + "WHERE r.univId = :univId "
            + "AND (r.cautionFactors IS NOT NULL OR r.dangerFactors IS NOT NULL)"
    )
    List<Route> findRiskRouteByUnivIdWithNode(@Param("univId") Long univId);

    @Query(value = """
    SELECT r.* FROM route r
    JOIN node n1 ON r.node1_id = n1.id
    JOIN node n2 ON r.node2_id = n2.id
    WHERE r.univ_id = :univId
      AND (
        (ST_Equals(n1.coordinates, ST_SRID(ST_GeomFromText(:point1), 4326))
        AND ST_Equals(n2.coordinates, ST_SRID(ST_GeomFromText(:point2), 4326)))
        OR
        (ST_Equals(n1.coordinates, ST_SRID(ST_GeomFromText(:point2), 4326))
        AND ST_Equals(n2.coordinates, ST_SRID(ST_GeomFromText(:point1), 4326)))
      )
    """, nativeQuery = true)
    Optional<Route> findRouteByPointsAndUnivId(
            @Param("univId") Long univId,
            @Param("point1") String point1,
            @Param("point2") String point2
    );

}
