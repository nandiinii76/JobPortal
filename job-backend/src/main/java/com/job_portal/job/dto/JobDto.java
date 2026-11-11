package com.job_portal.job.dto;

import com.job_portal.job.model.Job;

public class JobDto {

    private Long id;
    private String title;
    private String company;
    private String location;
    private String description;
    private Double salary;
    private String category;
    private String jobType;
    private String experienceLevel;

    private Long employerId;
    private String employerName;

    public JobDto() {
    }

    public JobDto(
            Long id,
            String title,
            String company,
            String location,
            String description,
            Double salary,
            String category,
            String jobType,
            String experienceLevel,
            Long employerId,
            String employerName) {

        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.description = description;
        this.salary = salary;
        this.category = category;
        this.jobType = jobType;
        this.experienceLevel = experienceLevel;
        this.employerId = employerId;
        this.employerName = employerName;
    }

    public static JobDto from(Job job) {

        if (job == null) {
            return null;
        }

        Long employerId = null;
        String employerName = null;

        if (job.getEmployer() != null) {
            employerId = job.getEmployer().getId();
            employerName = job.getEmployer().getName();
        }

        return new JobDto(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getDescription(),
                job.getSalary(),
                job.getCategory(),
                job.getJobType(),
                job.getExperienceLevel(),
                employerId,
                employerName
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getEmployerId() {
        return employerId;
    }

    public void setEmployerId(Long employerId) {
        this.employerId = employerId;
    }

    public String getEmployerName() {
        return employerName;
    }

    public void setEmployerName(String employerName) {
        this.employerName = employerName;
    }
}