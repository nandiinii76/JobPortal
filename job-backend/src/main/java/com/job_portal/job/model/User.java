package com.job_portal.job.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "users")
public class User {

    // ==========================================
    // PRIMARY KEY
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // BASIC USER INFORMATION
    // ==========================================

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    /*
     * Roles:
     *
     * ROLE_JOB_SEEKER
     * ROLE_EMPLOYER
     * ROLE_RECRUITER
     * ROLE_ADMIN
     */
    @Column(nullable = false)
    private String role;

    // ==========================================
    // EMPLOYER PROFILE
    // ==========================================

    @Column(length = 2000)
    private String companyDescription;

    private String companyWebsite;

    private String companyLogo;

    private String companyAddress;

    private String contactNumber;

    // ==========================================
    // APPLICATIONS
    // ==========================================

    @OneToMany(
        mappedBy = "user",
        cascade = CascadeType.ALL
    )
    @JsonIgnore
    private List<Application> applications = new ArrayList<>();

    // ==========================================
    // EMPLOYER JOBS
    // ==========================================

    @OneToMany(
        mappedBy = "employer",
        cascade = CascadeType.ALL
    )
    @JsonIgnore
    private List<Job> jobs = new ArrayList<>();

    // ==========================================
    // RESUME
    // ==========================================

    @OneToOne(
        mappedBy = "user",
        cascade = CascadeType.ALL
    )
    @JsonManagedReference
    private Resume resume;

    // ==========================================
    // CONSTRUCTORS
    // ==========================================

    public User() {
    }

    public User(
        String name,
        String email,
        String password,
        String role
    ) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // ==========================================
    // GETTERS AND SETTERS
    // ==========================================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // ==========================================
    // EMPLOYER PROFILE GETTERS / SETTERS
    // ==========================================

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

    // ==========================================
    // APPLICATIONS
    // ==========================================

    public List<Application> getApplications() {
        return applications;
    }

    public void setApplications(List<Application> applications) {
        this.applications = applications;
    }

    // ==========================================
    // JOBS
    // ==========================================

    public List<Job> getJobs() {
        return jobs;
    }

    public void setJobs(List<Job> jobs) {
        this.jobs = jobs;
    }

    // ==========================================
    // RESUME
    // ==========================================

    public Resume getResume() {
        return resume;
    }

    public void setResume(Resume resume) {
        this.resume = resume;
    }
}