package com.job_portal.job.dto;

public class EmployerAnalyticsResponse {

    private Long totalJobs;
    private Long totalApplications;
    private Long shortlistedApplications;
    private Long rejectedApplications;
    private Long pendingApplications;

    public EmployerAnalyticsResponse() {
    }

    public EmployerAnalyticsResponse(
            Long totalJobs,
            Long totalApplications,
            Long shortlistedApplications,
            Long rejectedApplications,
            Long pendingApplications) {

        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
        this.shortlistedApplications = shortlistedApplications;
        this.rejectedApplications = rejectedApplications;
        this.pendingApplications = pendingApplications;
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

    public Long getShortlistedApplications() {
        return shortlistedApplications;
    }

    public void setShortlistedApplications(Long shortlistedApplications) {
        this.shortlistedApplications = shortlistedApplications;
    }

    public Long getRejectedApplications() {
        return rejectedApplications;
    }

    public void setRejectedApplications(Long rejectedApplications) {
        this.rejectedApplications = rejectedApplications;
    }

    public Long getPendingApplications() {
        return pendingApplications;
    }

    public void setPendingApplications(Long pendingApplications) {
        this.pendingApplications = pendingApplications;
    }
}