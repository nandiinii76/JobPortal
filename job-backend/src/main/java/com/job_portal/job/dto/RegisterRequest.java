package com.job_portal.job.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    // ==========================================
    // NAME
    // ==========================================

    @NotBlank(message = "Name is required")
    @Size(
            min = 2,
            max = 100,
            message = "Name must be between 2 and 100 characters"
    )
    private String name;

    // ==========================================
    // EMAIL
    // ==========================================

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(
            max = 150,
            message = "Email cannot exceed 150 characters"
    )
    private String email;

    // ==========================================
    // PASSWORD
    // ==========================================

    @NotBlank(message = "Password is required")
    @Size(
            min = 6,
            max = 100,
            message = "Password must be between 6 and 100 characters"
    )
    private String password;

    // ==========================================
    // ROLE
    // ==========================================

    @NotBlank(message = "Role is required")
    private String role;

    // ==========================================
    // CONTACT NUMBER
    // ==========================================

    @Size(
            max = 20,
            message = "Contact number cannot exceed 20 characters"
    )
    private String contactNumber;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public RegisterRequest() {
    }

    // ==========================================
    // GETTERS
    // ==========================================

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    // ==========================================
    // SETTERS
    // ==========================================

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}