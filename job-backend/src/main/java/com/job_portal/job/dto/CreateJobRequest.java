package com.job_portal.job.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateJobRequest {

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name cannot exceed 150 characters")
    private String company;

    @NotBlank(message = "Location is required")
    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    @NotBlank(message = "Job description is required")
    @Size(max = 3000, message = "Job description cannot exceed 3000 characters")
    private String description;

    @NotNull(message = "Salary is required")
    @DecimalMin(value = "0.0", message = "Salary cannot be negative")
    private Double salary;

    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @Size(max = 50, message = "Job type cannot exceed 50 characters")
    private String jobType;

    @Size(max = 50, message = "Experience level cannot exceed 50 characters")
    private String experienceLevel;

    public CreateJobRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
}