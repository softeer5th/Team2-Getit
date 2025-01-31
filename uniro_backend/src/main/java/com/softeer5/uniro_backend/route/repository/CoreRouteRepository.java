package com.softeer5.uniro_backend.route.repository;

import com.softeer5.uniro_backend.route.entity.CoreRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoreRouteRepository extends JpaRepository<CoreRoute, Long> {
    List<CoreRoute> findByUnivId(Long univId);
}
