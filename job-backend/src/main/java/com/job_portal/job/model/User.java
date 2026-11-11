package com.job_portal.job.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    @JsonIgnore
    private String password;

    /*
     * Roles:
     *
     * ROLE_JOB_SEEKER
     * ROLE_EMPLOYER
     * ROLE_RECRUITER
     * ROLE_ADMIN
     * ROLE_SUPER_ADMIN
     */

    @Column(nullable = false, length = 30)
    private String role;

    // ==========================================
    // EMPLOYER PROFILE
    // ==========================================

    @Column(length = 2000)
    private String companyDescription;

    @Column(length = 255)
    private String companyWebsite;

    @Column(length = 500)
    private String companyLogo;

    @Column(length = 255)
    private String companyAddress;

    @Column(length = 20)
    private String contactNumber;

    // ==========================================
    // APPLICATIONS
    // ==========================================

    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<Application> applications =
            new ArrayList<>();

    // ==========================================
    // EMPLOYER JOBS
    // ==========================================

    @OneToMany(
            mappedBy = "employer",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<Job> jobs =
            new ArrayList<>();

    // ==========================================
    // RESUME
    // ==========================================

    @OneToOne(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    @JsonIgnore
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
            String role) {

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

    public void setId(Long id) {
        this.id = id;
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
    // EMPLOYER PROFILE
    // ==========================================

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(
            String companyDescription) {

        this.companyDescription = companyDescription;
    }

    public String getCompanyWebsite() {
        return companyWebsite;
    }

    public void setCompanyWebsite(
            String companyWebsite) {

        this.companyWebsite = companyWebsite;
    }

    public String getCompanyLogo() {
        return companyLogo;
    }

    public void setCompanyLogo(
            String companyLogo) {

        this.companyLogo = companyLogo;
    }

    public String getCompanyAddress() {
        return companyAddress;
    }

    public void setCompanyAddress(
            String companyAddress) {

        this.companyAddress = companyAddress;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(
            String contactNumber) {

        this.contactNumber = contactNumber;
    }

    // ==========================================
    // APPLICATIONS
    // ==========================================

    public List<Application> getApplications() {
        return applications;
    }

    public void setApplications(
            List<Application> applications) {

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