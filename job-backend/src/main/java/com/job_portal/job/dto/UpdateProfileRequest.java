package com.job_portal.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

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

    public UpdateProfileRequest() {
    }

    // ==========================================
    // GETTERS
    // ==========================================

    public String getName() {
        return name;
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

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}