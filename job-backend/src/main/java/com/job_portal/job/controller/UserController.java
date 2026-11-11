package com.job_portal.job.controller;

import com.job_portal.job.dto.AuthResponse;
import com.job_portal.job.dto.ChangePasswordRequest;
import com.job_portal.job.dto.LoginRequest;
import com.job_portal.job.dto.RegisterRequest;
import com.job_portal.job.dto.UpdateProfileRequest;
import com.job_portal.job.dto.UserProfileResponse;
import com.job_portal.job.dto.UserResponse;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.UserRepository;
import com.job_portal.job.security.JwtUtil;
import com.job_portal.job.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService service;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserController(
            UserService service,
            UserRepository userRepository,
            JwtUtil jwtUtil) {

        this.service = service;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // =====================================================
    // REGISTER
    // POST /users/register
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setContactNumber(request.getContactNumber());

        User savedUser = service.register(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UserResponse.from(savedUser));
    }

    // =====================================================
    // LOGIN
    // POST /users/login
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        User user = service.login(
                request.getEmail(),
                request.getPassword()
        );

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
    }

    // =====================================================
    // GET USER COUNT
    // GET /users/count
    // =====================================================

    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Long> getUserCount() {

        return ResponseEntity.ok(
                userRepository.count()
        );
    }

    // =====================================================
    // GET USER BY ID
    // GET /users/{userId}
    // =====================================================

    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUser(
            @PathVariable Long userId,
            Authentication authentication) {

        if (!isAuthenticated(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication is required.");
        }

        Long authenticatedUserId =
                getAuthenticatedUserId(authentication);

        if (authenticatedUserId == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Authenticated user could not be found.");
        }

        // User can access their own profile.
        // Admin and Super Admin can access any profile.
        if (!authenticatedUserId.equals(userId)
                && !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to view this profile.");
        }

        User user = service.getUserById(userId);

        return ResponseEntity.ok(
                UserProfileResponse.from(user)
        );
    }

    // =====================================================
    // UPDATE PROFILE
    // PUT /users/{userId}
    // =====================================================

    @PutMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        if (!isAuthenticated(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication is required.");
        }

        Long authenticatedUserId =
                getAuthenticatedUserId(authentication);

        if (authenticatedUserId == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Authenticated user could not be found.");
        }

        // User can update their own profile.
        // Admin and Super Admin can update any profile.
        if (!authenticatedUserId.equals(userId)
                && !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to update this profile.");
        }

        User updatedUser = service.updateProfile(
                userId,
                request.getName(),
                request.getContactNumber()
        );

        return ResponseEntity.ok(
                UserResponse.from(updatedUser)
        );
    }

    // =====================================================
    // CHANGE PASSWORD
    // PUT /users/{userId}/change-password
    // =====================================================

    @PutMapping("/{userId}/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        if (!isAuthenticated(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication is required.");
        }

        Long authenticatedUserId =
                getAuthenticatedUserId(authentication);

        // Password can only be changed by the account owner.
        // Admins cannot change another user's password through this endpoint.
        if (authenticatedUserId == null
                || !authenticatedUserId.equals(userId)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only change your own password.");
        }

        service.changePassword(
                userId,
                request.getCurrentPassword(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(
                "Password changed successfully"
        );
    }

    // =====================================================
    // GET AUTHENTICATED USER ID
    // =====================================================

    private Long getAuthenticatedUserId(
            Authentication authentication) {

        if (!isAuthenticated(authentication)) {
            return null;
        }

        String email = authentication.getName();

        if (email == null || email.trim().isEmpty()) {
            return null;
        }

        User user = userRepository.findByEmail(
                email.trim().toLowerCase()
        );

        if (user == null) {
            return null;
        }

        return user.getId();
    }

    // =====================================================
    // AUTHENTICATION CHECK
    // =====================================================

    private boolean isAuthenticated(
            Authentication authentication) {

        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getName() != null
                && !authentication.getName()
                        .trim()
                        .isEmpty();
    }

    // =====================================================
    // ADMIN CHECK
    // =====================================================

    private boolean isAdmin(
            Authentication authentication) {

        if (!isAuthenticated(authentication)) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_ADMIN")
                        || authority.getAuthority()
                                .equals("ROLE_SUPER_ADMIN")
                );
    }
}