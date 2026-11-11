package com.job_portal.job.model;

import java.time.LocalDateTime;
import java.util.Locale;

import jakarta.persistence.*;

@Entity
@Table(name = "applications")
public class Application {

    // ==========================================
    // PRIMARY KEY
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // CANDIDATE
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ==========================================
    // JOB
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    // ==========================================
    // APPLICATION STATUS
    // ==========================================

    @Column(nullable = false, length = 30)
    private String status;

    // ==========================================
    // TIMESTAMPS
    // ==========================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public Application() {
    }

    // ==========================================
    // JPA LIFECYCLE
    // ==========================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (status == null || status.trim().isEmpty()) {
            status = "APPLIED";
        } else {
            status = status.trim().toUpperCase(Locale.ROOT);
        }
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();

        if (status != null && !status.trim().isEmpty()) {
            status = status.trim().toUpperCase(Locale.ROOT);
        }
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {

        if (status == null || status.trim().isEmpty()) {
            this.status = "APPLIED";
            return;
        }

        this.status = status.trim().toUpperCase(Locale.ROOT);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}