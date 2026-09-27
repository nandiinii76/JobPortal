package com.job_portal.job.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.job.dto.DashboardStats;
import com.job_portal.job.repository.ApplicationRepository;
import com.job_portal.job.repository.InterviewRepository;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.ResumeRepository;

@Service
public class DashboardService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    // ==========================
    // Dashboard Statistics
    // ==========================
    public DashboardStats getDashboardStats() {

        long totalJobs = jobRepository.count();

        long totalApplications = applicationRepository.count();

        long totalInterviews = interviewRepository.count();

        long totalResumes = resumeRepository.count();

        return new DashboardStats(
                totalJobs,
                totalApplications,
                totalInterviews,
                totalResumes
        );
    }
}
