package com.job_portal.job.dto;

import java.util.List;

public class CompanyProfileDto {

    private Long id;

    private String companyName;

    private String companyDescription;

    private String companyWebsite;

    private String companyLogo;

    private String companyAddress;

    private String contactNumber;

    private List<JobDto> jobs;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public CompanyProfileDto() {
    }

    // ==========================================
    // FULL CONSTRUCTOR
    // ==========================================

    public CompanyProfileDto(
            Long id,
            String companyName,
            String companyDescription,
            String companyWebsite,
            String companyLogo,
            String companyAddress,
            String contactNumber,
            List<JobDto> jobs) {

        this.id = id;
        this.companyName = companyName;
        this.companyDescription = companyDescription;
        this.companyWebsite = companyWebsite;
        this.companyLogo = companyLogo;
        this.companyAddress = companyAddress;
        this.contactNumber = contactNumber;
        this.jobs = jobs;
    }

    // ==========================================
    // GETTERS AND SETTERS
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(String companyWebsite) {
        this.companyWebsite = companyWebsite;
    }

    public String getCompanyLogo() {
        return companyLogo;
    }

    public void setCompanyLogo(String companyLogo) {
        this.companyLogo = companyLogo;
    }

    public String getCompanyAddress() {
        return companyAddress;
    }

    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public List<JobDto> getJobs() {
        return jobs;
    }

    public void setJobs(List<JobDto> jobs) {
        this.jobs = jobs;
    }
}