package com.job_portal.job.model;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String resumeUrl;

    private String skills;

    private String education;

    private String experience;

    private String phone;

    private String linkedin;

    private String github;

    @JsonBackReference
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    public Resume() {
    }

    public Resume(Long id, String resumeUrl, String skills,
                  String education, String experience,
                  String phone, String linkedin,
                  String github, User user) {
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