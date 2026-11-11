package com.job_portal.job.dto;

import java.time.LocalDateTime;
import java.util.Locale;

import com.job_portal.job.model.Application;

public class ApplicationDto {

    private Long id;

    private Long userId;
    private String userName;
    private String userEmail;
    private String contactNumber;

    private Long jobId;
    private String jobTitle;
    private String company;
    private String location;
    private Double salary;

    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public ApplicationDto() {
    }

    public ApplicationDto(
            Long id,
            Long userId,
            String userName,
            String userEmail,
            String contactNumber,
            Long jobId,
            String jobTitle,
            String company,
            String location,
            Double salary,
            String status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.contactNumber = contactNumber;

        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.company = company;
        this.location = location;
        this.salary = salary;

        this.status = normalizeStatus(status);

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // =====================================================
    // ENTITY → DTO
    // =====================================================

    public static ApplicationDto from(
            Application application) {

        if (application == null) {
            return null;
        }

        Long userId = null;
        String userName = null;
        String userEmail = null;
        String contactNumber = null;

        Long jobId = null;
        String jobTitle = null;
        String company = null;
        String location = null;
        Double salary = null;

        if (application.getUser() != null) {

            userId = application.getUser().getId();
            userName = application.getUser().getName();
            userEmail = application.getUser().getEmail();
            contactNumber =
                    application.getUser().getContactNumber();
        }

        if (application.getJob() != null) {

            jobId = application.getJob().getId();
            jobTitle = application.getJob().getTitle();
            company = application.getJob().getCompany();
            location = application.getJob().getLocation();
            salary = application.getJob().getSalary();
        }

        return new ApplicationDto(
                application.getId(),
                userId,
                userName,
                userEmail,
                contactNumber,
                jobId,
                jobTitle,
                company,
                location,
                salary,
                application.getStatus(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }

    // =====================================================
    // GETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public Long getJobId() {
        return jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getCompany() {
        return company;
    }

    public String getLocation() {
        return location;
    }

    public Double getSalary() {
        return salary;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // =====================================================
    // SETTERS
    // =====================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public void setStatus(String status) {
        this.status = normalizeStatus(status);
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // =====================================================
    // STATUS NORMALIZATION
    // =====================================================

    private static String normalizeStatus(String status) {

        if (status == null ||
                status.trim().isEmpty()) {

            return "APPLIED";
        }

        return status
                .trim()
                .toUpperCase(Locale.ROOT);
    }
}