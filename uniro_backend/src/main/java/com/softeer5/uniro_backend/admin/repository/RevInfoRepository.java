package com.softeer5.uniro_backend.admin.repository;

import com.softeer5.uniro_backend.admin.entity.RevInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface RevInfoRepository extends JpaRepository<RevInfo,Long> {
    @Query("SELECT r FROM RevInfo r WHERE r.univId = :univId AND r.rev >= :versionId")
    List<RevInfo> findAllByUnivIdAfterVersionId(Long univId, Long versionId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM RevInfo r WHERE r.univId = :univId AND r.rev > :versionId")
    void deleteAllAfterVersionId(Long univId, Long versionId);

    Optional<RevInfo> findFirstByUnivIdOrderByRevDesc(Long univId);

    Optional<RevInfo> findFirstByUnivIdAndRevAfter(Long univId, Long rev);
}
