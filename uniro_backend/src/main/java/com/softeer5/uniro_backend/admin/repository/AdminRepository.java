package com.softeer5.uniro_backend.admin.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.softeer5.uniro_backend.admin.entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {

	Optional<Admin> findByUnivId(Long univId);
}
