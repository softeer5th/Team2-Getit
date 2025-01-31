package com.softeer5.uniro_backend.univ.repository;

import com.softeer5.uniro_backend.univ.entity.Univ;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnivRepository extends JpaRepository<Univ, Long>, UnivCustomRepository {
}
