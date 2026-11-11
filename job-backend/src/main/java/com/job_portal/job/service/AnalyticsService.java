package com.job_portal.job.service;

import org.springframework.stereotype.Service;

import com.job_portal.job.repository.ApplicationRepository;
import com.job_portal.job.repository.JobRepository;

@Service
public class AnalyticsService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public AnalyticsService(
            JobRepository jobRepository,
            ApplicationRepository applicationRepository) {

        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    // =====================================================
    // GET TOTAL JOBS FOR EMPLOYER
    // =====================================================

    public long getTotalJobs(Long employerId) {

        if (employerId == null) {
            return 0;
        }

        return jobRepository.countByEmployerId(
                employerId
        );
    }

    // =====================================================
    // GET TOTAL APPLICATIONS FOR EMPLOYER
    // =====================================================

    public long getTotalApplications(Long employerId) {

        if (employerId == null) {
            return 0;
        }

        return applicationRepository.countByJobEmployerId(
                employerId
        );
    }

    // =====================================================
    // GET APPLICATION COUNT FOR JOB
    // =====================================================

    public long getApplicationsForJob(Long jobId) {

        if (jobId == null) {
            return 0;
        }

        return applicationRepository.countByJobId(
                jobId
        );
    }
}