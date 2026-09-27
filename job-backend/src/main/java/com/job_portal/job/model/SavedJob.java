package com.job_portal.job.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "saved_jobs",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id","job_id"})
       })
public class SavedJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="job_id", nullable=false)
    private Job job;

    private LocalDateTime savedAt;

    @PrePersist
    public void prePersist() {
        savedAt = LocalDateTime.now();
    }

    public SavedJob() {
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}