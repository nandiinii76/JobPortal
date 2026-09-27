package com.job_portal.job.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.job_portal.job.model.Interview;

@Repository
public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    // ==========================================
    // FIND INTERVIEW BY APPLICATION
    // ==========================================

    Optional<Interview> findByApplicationId(
            Long applicationId
    );

    // ==========================================
    // FIND ALL INTERVIEWS FOR AN EMPLOYER
    // ORDERED BY DATE AND TIME
    // ==========================================

    List<Interview>
    findByApplicationJobEmployerIdOrderByInterviewDateAscInterviewTimeAsc(
            Long employerId
    );

    // ==========================================
    // FIND ALL INTERVIEWS FOR A CANDIDATE
    // ORDERED BY DATE AND TIME
    // ==========================================

    List<Interview>
    findByApplicationUserIdOrderByInterviewDateAscInterviewTimeAsc(
            Long userId
    );

    // ==========================================
    // FIND INTERVIEWS BY STATUS
    // ==========================================

    List<Interview> findByStatus(
            String status
    );

    // ==========================================
    // FIND EMPLOYER INTERVIEWS BY STATUS
    // ORDERED BY DATE AND TIME
    // ==========================================

    List<Interview>
    findByApplicationJobEmployerIdAndStatusOrderByInterviewDateAscInterviewTimeAsc(
            Long employerId,
            String status
    );

    // ==========================================
    // FIND CANDIDATE INTERVIEWS BY STATUS
    // ORDERED BY DATE AND TIME
    // ==========================================

    List<Interview>
    findByApplicationUserIdAndStatusOrderByInterviewDateAscInterviewTimeAsc(
            Long userId,
            String status
    );

    // ==========================================
    // CHECK IF APPLICATION ALREADY HAS INTERVIEW
    // ==========================================

    boolean existsByApplicationId(
            Long applicationId
    );

    // ==========================================
    // COUNT INTERVIEWS BY STATUS
    // ==========================================

    long countByStatus(
            String status
    );
}