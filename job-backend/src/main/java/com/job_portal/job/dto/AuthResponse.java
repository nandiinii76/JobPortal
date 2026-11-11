package com.job_portal.job.dto;

public class AuthResponse {

    private String token;
    private Long userId;
    private String role;

    // ==========================================
    // CONSTRUCTORS
    // ==========================================

    public AuthResponse() {
    }

    public AuthResponse(
            String token,
            Long userId,
            String role) {

        this.token = token;
        this.userId = userId;
        this.role = role;
    }

    // ==========================================
    // GETTERS
    // ==========================================

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }

    // ==========================================
    // SETTERS
    // ==========================================

    public void setToken(String token) {
        this.token = token;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setRole(String role) {
        this.role = role;
    }
}