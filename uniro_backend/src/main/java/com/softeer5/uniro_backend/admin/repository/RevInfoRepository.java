package com.softeer5.uniro_backend.admin.repository;

import com.softeer5.uniro_backend.admin.entity.RevInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface RevInfoRepository extends JpaRepository<RevInfo,Long> {
    List<RevInfo> findAllByUnivId(Long univId);
}
