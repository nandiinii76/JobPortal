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

    List<Job> findByEmployerId(Long employerId);

    List<Job> findByCompany(String company);

    long countByEmployerId(Long employerId);
}