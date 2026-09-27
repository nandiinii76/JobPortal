package com.job_portal.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.job_portal.job.model.Application;

@Repository
public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    // =====================================================
    // CHECK DUPLICATE APPLICATION
    // =====================================================

    boolean existsByUserIdAndJobId(
            Long userId,
            Long jobId
    );


    // =====================================================
    // GET APPLICATIONS BY USER
    // =====================================================

    List<Application> findByUserId(
            Long userId
    );


    // =====================================================
    // GET APPLICATIONS BY JOB
    // =====================================================

    List<Application> findByJobId(
            Long jobId
    );


    // =====================================================
    // GET APPLICATIONS BY EMPLOYER
    // =====================================================

    List<Application> findByJobEmployerId(
            Long employerId
    );


    // =====================================================
    // GET APPLICATIONS BY STATUS
    // =====================================================

    List<Application> findByStatus(
            String status
    );


    // =====================================================
    // COUNT BY STATUS
    // =====================================================

    long countByStatus(
            String status
    );


    // =====================================================
    // COUNT APPLICATIONS FOR EMPLOYER
    // =====================================================

    @Query("""
            SELECT COUNT(a)
            FROM Application a
            WHERE a.job.employer.id = :employerId
            """)
    long countApplicationsByEmployer(
            Long employerId
    );


    // =====================================================
    // COUNT APPLICATIONS FOR EMPLOYER
    // METHOD EXPECTED BY AnalyticsService
    // =====================================================

    long countByJobEmployerId(
            Long employerId
    );


    // =====================================================
    // COUNT APPLICATIONS FOR A PARTICULAR JOB
    // =====================================================

    long countByJobId(
            Long jobId
    );


    // =====================================================
    // COUNT APPLICATIONS FOR USER
    // =====================================================

    long countByUserId(
            Long userId
    );


    // =====================================================
    // DELETE APPLICATIONS BY USER
    // =====================================================

    void deleteByUserId(
            Long userId
    );


    // =====================================================
    // DELETE APPLICATIONS FOR JOB
    // =====================================================

    void deleteByJobId(
            Long jobId
    );
}