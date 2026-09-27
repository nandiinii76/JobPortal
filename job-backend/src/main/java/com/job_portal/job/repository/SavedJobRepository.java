package com.job_portal.job.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.job_portal.job.model.SavedJob;

@Repository
public interface SavedJobRepository
        extends JpaRepository<SavedJob, Long> {

    List<SavedJob> findByUserId(Long userId);

    Optional<SavedJob> findByUserIdAndJobId(
            Long userId,
            Long jobId);

    boolean existsByUserIdAndJobId(
            Long userId,
            Long jobId);

    void deleteByUserIdAndJobId(
            Long userId,
            Long jobId);

    long countByUserId(Long userId);
}