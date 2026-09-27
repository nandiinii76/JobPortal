package com.job_portal.job.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.job.repository.ApplicationRepository;
import com.job_portal.job.repository.JobRepository;

@Service
public class AnalyticsService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    // ==========================================
    // TOTAL JOBS POSTED BY EMPLOYER
    // ==========================================

    public long getTotalJobs(Long employerId) {

        return jobRepository.countByEmployerId(employerId);
    }

    // ==========================================
    // TOTAL APPLICATIONS RECEIVED BY EMPLOYER
    // ==========================================

    public long getTotalApplications(Long employerId) {

        return applicationRepository
                .countByJobEmployerId(employerId);
    }

    // ==========================================
    // APPLICATION COUNT FOR ONE JOB
    // ==========================================

    public long getApplicationsForJob(Long jobId) {

        return applicationRepository
                .countByJobId(jobId);
    }
}