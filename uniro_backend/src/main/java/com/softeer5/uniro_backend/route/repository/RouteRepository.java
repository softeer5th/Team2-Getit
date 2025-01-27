package com.softeer5.uniro_backend.route.repository;

import com.softeer5.uniro_backend.route.Route;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {

    @EntityGraph(attributePaths = {"node1", "node2"})
    @Query("SELECT r FROM Route r")
    List<Route> findAllWithNodes();
}
