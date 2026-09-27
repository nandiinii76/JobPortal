package com.job_portal.job.dto;

public class DashboardStats {

    private long totalJobs;
    private long totalApplications;
    private long totalInterviews;
    private long totalResumes;

    public DashboardStats() {
    }

    public DashboardStats(long totalJobs,
                          long totalApplications,
                          long totalInterviews,
                          long totalResumes) {

        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
        this.totalInterviews = totalInterviews;
        this.totalResumes = totalResumes;
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getTotalInterviews() {
        return totalInterviews;
    }

    public void setTotalInterviews(long totalInterviews) {
        this.totalInterviews = totalInterviews;
    }

    public long getTotalResumes() {
        return totalResumes;
    }

    public void setTotalResumes(long totalResumes) {
        this.totalResumes = totalResumes;
    }
}
