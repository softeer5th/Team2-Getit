package com.softeer5.uniro_backend.route.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.softeer5.uniro_backend.route.entity.Route;

public interface RouteRepository extends JpaRepository<Route, Long> {
	@Query("SELECT r "
		+ "FROM Route r "
		+ "JOIN FETCH r.node1 n1 "
		+ "JOIN FETCH r.node2 n2 "
		+ "WHERE r.univId = :univId "
		+ "AND (r.cautionFactors IS NOT NULL OR r.dangerFactors IS NOT NULL)"
	)
	List<Route> findRiskRouteByUnivIdWithNode(@Param("univId") Long univId);
}
