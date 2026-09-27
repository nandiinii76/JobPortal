package com.job_portal.job.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.job_portal.job.exception.UserNotFoundException;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;


    // ==========================================
    // REGISTER USER
    // ==========================================

    public User register(User user) {

        if (user.getEmail() == null ||
            user.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                "Email is required"
            );
        }

        String email = user.getEmail()
                .trim()
                .toLowerCase();

        if (repo.findByEmail(email) != null) {

            throw new RuntimeException(
                "Email already exists"
            );
        }

        user.setEmail(email);

        String role = user.getRole();

        if (role == null ||
            role.trim().isEmpty()) {

            role = "ROLE_JOB_SEEKER";
        }

        role = role.toUpperCase().trim();

        if (role.equals("ROLE_USER") ||
            role.equals("USER") ||
            role.equals("ROLE_CANDIDATE") ||
            role.equals("CANDIDATE")) {

            role = "ROLE_JOB_SEEKER";
        }

        if (!role.equals("ROLE_JOB_SEEKER") &&
            !role.equals("ROLE_EMPLOYER") &&
            !role.equals("ROLE_RECRUITER")) {

            throw new RuntimeException(
                "Invalid registration role"
            );
        }

        user.setRole(role);

        if (user.getPassword() == null ||
            user.getPassword().trim().isEmpty()) {

            throw new RuntimeException(
                "Password is required"
            );
        }

        user.setPassword(
            passwordEncoder.encode(
                user.getPassword()
            )
        );

        return repo.save(user);
    }


    // ==========================================
    // LOGIN
    // ==========================================

    public User login(
            String email,
            String password) {

        User user = repo.findByEmail(
                email.trim().toLowerCase()
        );

        if (user == null) {

            throw new UserNotFoundException(
                "User not found with email: " + email
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new RuntimeException(
                "Invalid credentials"
            );
        }

        return user;
    }


    // ==========================================
    // GET USER ROLE
    // ==========================================

    public String getUserRole(String email) {

        User user = repo.findByEmail(
                email.trim().toLowerCase()
        );

        if (user == null) {

            throw new UserNotFoundException(
                "User not found with email: " + email
            );
        }

        return user.getRole();
    }


    // ==========================================
    // GET USER BY ID
    // ==========================================

    public User getUserById(Long userId) {

        if (userId == null) {

            throw new RuntimeException(
                "User ID is required"
            );
        }

        return repo.findById(userId)
                .orElseThrow(() ->
                    new UserNotFoundException(
                        "User not found with ID: " + userId
                    )
                );
    }


    // ==========================================
    // UPDATE USER PROFILE
    // ==========================================

    public User updateProfile(
            Long userId,
            String name,
            String contactNumber) {

        if (userId == null) {

            throw new RuntimeException(
                "User ID is required"
            );
        }

        User user = repo.findById(userId)
                .orElseThrow(() ->
                    new UserNotFoundException(
                        "User not found with ID: " + userId
                    )
                );


        // ------------------------------------------
        // UPDATE NAME
        // ------------------------------------------

        if (name != null &&
            !name.trim().isEmpty()) {

            user.setName(
                name.trim()
            );
        }


        // ------------------------------------------
        // UPDATE CONTACT NUMBER
        // ------------------------------------------

        if (contactNumber != null) {

            user.setContactNumber(
                contactNumber.trim()
            );
        }


        return repo.save(user);
    }


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

    public boolean changePassword(
            Long userId,
            String currentPassword,
            String newPassword) {

        if (userId == null) {

            throw new RuntimeException(
                "User ID is required"
            );
        }

        if (currentPassword == null ||
            currentPassword.trim().isEmpty()) {

            throw new RuntimeException(
                "Current password is required"
            );
        }

        if (newPassword == null ||
            newPassword.trim().isEmpty()) {

            throw new RuntimeException(
                "New password is required"
            );
        }

        if (newPassword.length() < 6) {

            throw new RuntimeException(
                "New password must be at least 6 characters"
            );
        }

        User user = repo.findById(userId)
                .orElse(null);

        if (user == null) {

            throw new UserNotFoundException(
                "User not found with ID: " + userId
            );
        }


        // ------------------------------------------
        // CHECK CURRENT PASSWORD
        // ------------------------------------------

        if (!passwordEncoder.matches(
                currentPassword,
                user.getPassword())) {

            throw new RuntimeException(
                "Current password is incorrect"
            );
        }


        // ------------------------------------------
        // PREVENT SAME PASSWORD
        // ------------------------------------------

        if (passwordEncoder.matches(
                newPassword,
                user.getPassword())) {

            throw new RuntimeException(
                "New password must be different from current password"
            );
        }


        // ------------------------------------------
        // ENCODE NEW PASSWORD
        // ------------------------------------------

        user.setPassword(
            passwordEncoder.encode(
                newPassword
            )
        );


        // ------------------------------------------
        // SAVE
        // ------------------------------------------

        repo.save(user);

        return true;
    }
}