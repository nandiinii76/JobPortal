package com.job_portal.job.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.job_portal.job.exception.UserNotFoundException;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository repo,
            PasswordEncoder passwordEncoder) {

        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // REGISTER USER
    // =====================================================

    public User register(User user) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "User details are required");
        }

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required");
        }

        String email = user.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (repo.findByEmail(email) != null) {
            throw new IllegalArgumentException(
                    "Email already exists");
        }

        user.setEmail(email);

        // =================================================
        // PASSWORD VALIDATION
        // =================================================

        if (user.getPassword() == null ||
                user.getPassword().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Password is required");
        }

        if (user.getPassword().length() < 6) {

            throw new IllegalArgumentException(
                    "Password must be at least 6 characters");
        }

        // =================================================
        // ROLE VALIDATION
        // =================================================

        String role = user.getRole();

        if (role == null || role.trim().isEmpty()) {
            role = "ROLE_JOB_SEEKER";
        }

        role = role
                .trim()
                .toUpperCase(Locale.ROOT);

        // Backward compatibility
        if (role.equals("ROLE_USER") ||
                role.equals("USER") ||
                role.equals("ROLE_CANDIDATE") ||
                role.equals("CANDIDATE")) {

            role = "ROLE_JOB_SEEKER";
        }

        if (!role.equals("ROLE_JOB_SEEKER") &&
                !role.equals("ROLE_EMPLOYER") &&
                !role.equals("ROLE_RECRUITER")) {

            throw new IllegalArgumentException(
                    "Invalid registration role");
        }

        user.setRole(role);

        // =================================================
        // ENCODE PASSWORD
        // =================================================

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        // =================================================
        // SAVE USER
        // =================================================

        return repo.save(user);
    }

    // =====================================================
    // LOGIN
    // =====================================================

    public User login(
            String email,
            String password) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required");
        }

        if (password == null ||
                password.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Password is required");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = repo.findByEmail(normalizedEmail);

        if (user == null) {

            throw new UserNotFoundException(
                    "User not found with email: "
                            + normalizedEmail);
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid credentials");
        }

        return user;
    }

    // =====================================================
    // GET USER ROLE
    // =====================================================

    public String getUserRole(String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required");
        }

        String normalizedEmail = email
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = repo.findByEmail(normalizedEmail);

        if (user == null) {

            throw new UserNotFoundException(
                    "User not found with email: "
                            + normalizedEmail);
        }

        return user.getRole();
    }

    // =====================================================
    // GET USER BY ID
    // =====================================================

    public User getUserById(Long userId) {

        if (userId == null) {

            throw new IllegalArgumentException(
                    "User ID is required");
        }

        return repo.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with ID: "
                                        + userId));
    }

    // =====================================================
    // UPDATE USER PROFILE
    // =====================================================

    public User updateProfile(
            Long userId,
            String name,
            String contactNumber) {

        if (userId == null) {

            throw new IllegalArgumentException(
                    "User ID is required");
        }

        User user = repo.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with ID: "
                                        + userId));

        // =================================================
        // UPDATE NAME
        // =================================================

        if (name != null &&
                !name.trim().isEmpty()) {

            String updatedName = name.trim();

            if (updatedName.length() < 2) {

                throw new IllegalArgumentException(
                        "Name must be at least 2 characters");
            }

            if (updatedName.length() > 100) {

                throw new IllegalArgumentException(
                        "Name cannot exceed 100 characters");
            }

            user.setName(updatedName);
        }

        // =================================================
        // UPDATE CONTACT NUMBER
        // =================================================

        if (contactNumber != null) {

            String updatedContact =
                    contactNumber.trim();

            if (updatedContact.length() > 20) {

                throw new IllegalArgumentException(
                        "Contact number cannot exceed 20 characters");
            }

            user.setContactNumber(updatedContact);
        }

        return repo.save(user);
    }

    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    public boolean changePassword(
            Long userId,
            String currentPassword,
            String newPassword) {

        if (userId == null) {

            throw new IllegalArgumentException(
                    "User ID is required");
        }

        if (currentPassword == null ||
                currentPassword.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Current password is required");
        }

        if (newPassword == null ||
                newPassword.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "New password is required");
        }

        if (newPassword.length() < 6) {

            throw new IllegalArgumentException(
                    "New password must be at least 6 characters");
        }

        if (newPassword.length() > 100) {

            throw new IllegalArgumentException(
                    "New password cannot exceed 100 characters");
        }

        // =================================================
        // FIND USER
        // =================================================

        User user = repo.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with ID: "
                                        + userId));

        // =================================================
        // CHECK CURRENT PASSWORD
        // =================================================

        if (!passwordEncoder.matches(
                currentPassword,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Current password is incorrect");
        }

        // =================================================
        // PREVENT SAME PASSWORD
        // =================================================

        if (passwordEncoder.matches(
                newPassword,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "New password must be different from current password");
        }

        // =================================================
        // ENCODE NEW PASSWORD
        // =================================================

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        repo.save(user);

        return true;
    }
}