package com.job_portal.job.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {

    // ==========================================
    // ID
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // USER
    // ==========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    // ==========================================
    // NOTIFICATION TYPE
    // ==========================================

    @Column(
            nullable = false,
            length = 50
    )
    private String type;

    // ==========================================
    // MESSAGE
    // ==========================================

    @Column(
            nullable = false,
            length = 500
    )
    private String message;

    // ==========================================
    // READ STATUS
    // ==========================================

    @Column(nullable = false)
    private boolean isRead = false;

    // ==========================================
    // CREATED TIME
    // ==========================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public Notification() {
    }

    public Notification(
            User user,
            String type,
            String message
    ) {

        this.user = user;
        this.type = type;
        this.message = message;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    // ==========================================
    // GET ID
    // ==========================================

    public Long getId() {
        return id;
    }

    // ==========================================
    // SET ID
    // ==========================================

    public void setId(Long id) {
        this.id = id;
    }

    // ==========================================
    // GET USER
    // ==========================================

    public User getUser() {
        return user;
    }

    // ==========================================
    // SET USER
    // ==========================================

    public void setUser(User user) {
        this.user = user;
    }

    // ==========================================
    // GET TYPE
    // ==========================================

    public String getType() {
        return type;
    }

    // ==========================================
    // SET TYPE
    // ==========================================

    public void setType(String type) {
        this.type = type;
    }

    // ==========================================
    // GET MESSAGE
    // ==========================================

    public String getMessage() {
        return message;
    }

    // ==========================================
    // SET MESSAGE
    // ==========================================

    public void setMessage(String message) {
        this.message = message;
    }

    // ==========================================
    // GET READ STATUS
    // ==========================================

    public boolean isRead() {
        return isRead;
    }

    // ==========================================
    // SET READ STATUS
    // ==========================================

    public void setRead(boolean read) {
        this.isRead = read;
    }

    // ==========================================
    // GET CREATED TIME
    // ==========================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ==========================================
    // SET CREATED TIME
    // ==========================================

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}