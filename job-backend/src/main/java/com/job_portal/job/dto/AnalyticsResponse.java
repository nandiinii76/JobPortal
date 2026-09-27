package com.job_portal.job.dto;

public class AnalyticsResponse {

    private Long totalUsers;
    private Long totalJobs;
    private Long totalApplications;

    public AnalyticsResponse() {
    }

    public AnalyticsResponse(Long totalUsers,
                             Long totalJobs,
                             Long totalApplications) {
        this.totalUsers = totalUsers;
        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(Long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public Long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(Long totalApplications) {
        this.totalApplications = totalApplications;
    }
}