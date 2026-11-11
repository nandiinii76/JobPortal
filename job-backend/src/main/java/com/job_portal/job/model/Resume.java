package com.job_portal.job.model;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "resumes")
public class Resume {

    // ==========================================
    // PRIMARY KEY
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // RESUME INFORMATION
    // ==========================================

    @Column(length = 500)
    private String resumeUrl;

    @Column(length = 3000)
    private String skills;

    @Column(length = 3000)
    private String education;

    @Column(length = 5000)
    private String experience;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String linkedin;

    @Column(length = 255)
    private String github;

    // ==========================================
    // USER RELATIONSHIP
    // ==========================================

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            unique = true,
            nullable = false
    )
    @JsonIgnore
    private User user;

    // ==========================================
    // CONSTRUCTORS
    // ==========================================

    public Resume() {
    }

    public Resume(
            Long id,
            String resumeUrl,
            String skills,
            String education,
            String experience,
            String phone,
            String linkedin,
            String github,
            User user) {

        this.id = id;
        this.resumeUrl = resumeUrl;
        this.skills = skills;
        this.education = education;
        this.experience = experience;
        this.phone = phone;
        this.linkedin = linkedin;
        this.github = github;
        this.user = user;
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

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}