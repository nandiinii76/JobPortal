package com.job_portal.job.dto;

import com.job_portal.job.model.User;

public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String contactNumber;


    public UserProfileResponse() {
    }


    public UserProfileResponse(
            Long id,
            String name,
            String email,
            String role,
            String contactNumber) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.contactNumber = contactNumber;
    }


    public static UserProfileResponse from(User user) {

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getContactNumber()
        );
    }


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


    public String getRole() {
        return role;
    }


    public void setRole(String role) {
        this.role = role;
    }


    public String getContactNumber() {
        return contactNumber;
    }


    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}
