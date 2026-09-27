package com.job_portal.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.job_portal.job.model.Job;

@Repository
public interface JobRepository
        extends JpaRepository<Job, Long>,
                JpaSpecificationExecutor<Job> {

    // =====================================================
    // GET JOBS BY EMPLOYER
    // =====================================================

    List<Job> findByEmployerId(Long employerId);


    // =====================================================
    // GET JOBS BY COMPANY
    // =====================================================

    List<Job> findByCompany(String company);


    // =====================================================
    // COUNT JOBS BY EMPLOYER
    // =====================================================

    long countByEmployerId(Long employerId);


    // =====================================================
    // COUNT ALL JOBS
    // =====================================================

    long count();
}