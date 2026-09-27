package com.job_portal.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.dto.AuthResponse;
import com.job_portal.job.dto.UserProfileResponse;
import com.job_portal.job.dto.UserResponse;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.UserRepository;
import com.job_portal.job.security.JwtUtil;
import com.job_portal.job.service.UserService;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    // ==========================================
    // REGISTER
    // ==========================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user
    ) {

        try {

            User savedUser = service.register(user);

            return ResponseEntity.ok(
                    UserResponse.from(savedUser)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // LOGIN
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        try {

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            /*
             * Your UserRepository.findByEmail()
             * returns User directly.
             */
            User user = userRepository.findByEmail(
                    request.getEmail()
            );

            if (user == null) {

                return ResponseEntity
                        .status(401)
                        .body("User not found");
            }

            /*
             * Your JwtUtil.generateToken()
             * requires email and role.
             */
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole()
            );

            AuthResponse response = new AuthResponse(
                    token,
                    user.getId(),
                    user.getRole()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }
    }

    // ==========================================
    // USER COUNT
    // ==========================================

    @GetMapping("/count")
    public ResponseEntity<Long> getUserCount() {

        return ResponseEntity.ok(
                userRepository.count()
        );
    }

    // ==========================================
    // GET USER PROFILE
    // ==========================================

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(
            @PathVariable Long userId
    ) {

        User user = service.getUserById(userId);

        if (user == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                UserProfileResponse.from(user)
        );
    }

    // ==========================================
    // UPDATE USER PROFILE
    // ==========================================

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @RequestBody UserProfileRequest request
    ) {

        try {

            User updatedUser = service.updateProfile(
                    userId,
                    request.getName(),
                    request.getContactNumber()
            );

            if (updatedUser == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(
                    UserProfileResponse.from(updatedUser)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // CHANGE PASSWORD - PUT
    // ==========================================

    @PutMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long userId,
            @RequestBody ChangePasswordRequest request
    ) {

        try {

            service.changePassword(
                    userId,
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );

            return ResponseEntity.ok(
                    "Password changed successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // CHANGE PASSWORD - POST
    // ==========================================

    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePasswordPost(
            @PathVariable Long userId,
            @RequestBody ChangePasswordRequest request
    ) {

        try {

            service.changePassword(
                    userId,
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );

            return ResponseEntity.ok(
                    "Password changed successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // LOGIN REQUEST
    // ==========================================

    public static class LoginRequest {

        private String email;
        private String password;

        public LoginRequest() {
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    // ==========================================
    // PROFILE REQUEST
    // ==========================================

    public static class UserProfileRequest {

        private String name;
        private String contactNumber;

        public UserProfileRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getContactNumber() {
            return contactNumber;
        }

        public void setContactNumber(String contactNumber) {
            this.contactNumber = contactNumber;
        }
    }

    // ==========================================
    // CHANGE PASSWORD REQUEST
    // ==========================================

    public static class ChangePasswordRequest {

        private String currentPassword;
        private String newPassword;

        public ChangePasswordRequest() {
        }

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}