package com.job_portal.job.controller;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.dto.ApplicationDto;
import com.job_portal.job.model.Application;
import com.job_portal.job.service.ApplicationService;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // =====================================================
    // APPLY FOR JOB
    // =====================================================

    @PostMapping("/apply/{jobId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ApplicationDto> applyForJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        Application application =
                applicationService.applyJob(email, jobId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApplicationDto.from(application));
    }

    // =====================================================
    // MY APPLICATIONS
    // =====================================================

    @GetMapping("/my")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<ApplicationDto>> getMyApplications(
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        List<Application> applications =
                applicationService.getApplicationsForUser(email);

        return ResponseEntity.ok(
                applications.stream()
                        .map(ApplicationDto::from)
                        .toList()
        );
    }

    // =====================================================
    // GET APPLICATION BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDto> getApplication(
            @PathVariable Long id,
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);
        String role = getAuthenticatedRole(authentication);

        Application application =
                applicationService.getApplication(id);

        if (application == null) {
            return ResponseEntity.notFound().build();
        }

        Long authenticatedUserId =
                applicationService.getUserIdByEmail(email);

        boolean allowed = false;

        // Candidate can see only their own application
        if (isJobSeeker(role)) {
            allowed = application.getUser() != null
                    && application.getUser().getId() != null
                    && application.getUser().getId()
                            .equals(authenticatedUserId);
        }

        // Employer / recruiter can see applications
        // belonging to their jobs
        if (isEmployerOrRecruiter(role)) {

            Long employerId =
                    application.getJob() != null
                            && application.getJob().getEmployer() != null
                            ? application.getJob()
                                    .getEmployer()
                                    .getId()
                            : null;

            allowed = employerId != null
                    && employerId.equals(authenticatedUserId);
        }

        // Admin can view everything
        if (isAdmin(role)) {
            allowed = true;
        }

        if (!allowed) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .build();
        }

        return ResponseEntity.ok(
                ApplicationDto.from(application)
        );
    }

    // =====================================================
    // GET APPLICATIONS FOR USER
    // =====================================================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<ApplicationDto>> getUserApplications(
            @PathVariable Long userId,
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        Long authenticatedUserId =
                applicationService.getUserIdByEmail(email);

        if (!userId.equals(authenticatedUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .build();
        }

        List<Application> applications =
                applicationService.getApplicationsByUser(userId);

        return ResponseEntity.ok(
                applications.stream()
                        .map(ApplicationDto::from)
                        .toList()
        );
    }

    // =====================================================
    // GET APPLICATIONS FOR JOB
    // =====================================================

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<List<ApplicationDto>> getJobApplications(
            @PathVariable Long jobId,
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        if (!applicationService.isJobOwnedByEmployer(
                jobId,
                email)) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .build();
        }

        List<Application> applications =
                applicationService.getApplicationsByJob(jobId);

        return ResponseEntity.ok(
                applications.stream()
                        .map(ApplicationDto::from)
                        .toList()
        );
    }

    // =====================================================
    // MY EMPLOYER APPLICATIONS
    // =====================================================

    @GetMapping("/employer")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<List<ApplicationDto>> getMyEmployerApplications(
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        List<Application> applications =
                applicationService.getApplicationsForEmployer(email);

        return ResponseEntity.ok(
                applications.stream()
                        .map(ApplicationDto::from)
                        .toList()
        );
    }

    // =====================================================
    // UPDATE APPLICATION STATUS
    // =====================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<ApplicationDto> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        Application application =
                applicationService.updateStatusForEmployer(
                        id,
                        status,
                        email
                );

        return ResponseEntity.ok(
                ApplicationDto.from(application)
        );
    }

    // =====================================================
    // APPLICATIONS BY STATUS
    // =====================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<List<ApplicationDto>> getApplicationsByStatus(
            @PathVariable String status,
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        List<Application> applications =
                applicationService.getApplicationsByEmployerAndStatus(
                        email,
                        status
                );

        return ResponseEntity.ok(
                applications.stream()
                        .map(ApplicationDto::from)
                        .toList()
        );
    }

    // =====================================================
    // DELETE APPLICATION
    // =====================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<String> deleteApplication(
            @PathVariable Long id,
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        applicationService.deleteApplicationForUser(
                id,
                email
        );

        return ResponseEntity.ok(
                "Application deleted successfully"
        );
    }

    // =====================================================
    // ADMIN - TOTAL APPLICATION COUNT
    // =====================================================

    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Long> getApplicationCount() {

        return ResponseEntity.ok(
                applicationService.getTotalApplications()
        );
    }

    // =====================================================
    // ADMIN - STATUS COUNTS
    // =====================================================

    @GetMapping("/analytics/applied")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Long> getAppliedCount() {

        return ResponseEntity.ok(
                applicationService.countByStatus("APPLIED")
        );
    }

    @GetMapping("/analytics/shortlisted")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Long> getShortlistedCount() {

        return ResponseEntity.ok(
                applicationService.countByStatus("SHORTLISTED")
        );
    }

    @GetMapping("/analytics/interview")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Long> getInterviewCount() {

        return ResponseEntity.ok(
                applicationService.countByStatus("INTERVIEW")
        );
    }

    @GetMapping("/analytics/rejected")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Long> getRejectedCount() {

        return ResponseEntity.ok(
                applicationService.countByStatus("REJECTED")
        );
    }

    @GetMapping("/analytics/hired")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Long> getHiredCount() {

        return ResponseEntity.ok(
                applicationService.countByStatus("HIRED")
        );
    }

    // =====================================================
    // EMPLOYER ANALYTICS
    // =====================================================

    @GetMapping("/analytics/employer")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<?> getEmployerAnalytics(
            Authentication authentication) {

        String email = getAuthenticatedEmail(authentication);

        return ResponseEntity.ok(
                applicationService.getEmployerAnalytics(email)
        );
    }

    // =====================================================
    // AUTHENTICATION HELPERS
    // =====================================================

    private String getAuthenticatedEmail(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Authentication is required"
            );
        }

        return authentication.getName()
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String getAuthenticatedRole(
            Authentication authentication) {

        if (authentication == null
                || authentication.getAuthorities() == null
                || authentication.getAuthorities().isEmpty()) {

            throw new IllegalArgumentException(
                    "Authentication role is required"
            );
        }

        return authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority()
                .toUpperCase(Locale.ROOT);
    }

    private boolean isJobSeeker(String role) {

        return role.equals("ROLE_JOB_SEEKER")
                || role.equals("JOB_SEEKER")
                || role.equals("ROLE_USER")
                || role.equals("USER")
                || role.equals("ROLE_CANDIDATE")
                || role.equals("CANDIDATE");
    }

    private boolean isEmployerOrRecruiter(String role) {

        return role.equals("ROLE_EMPLOYER")
                || role.equals("EMPLOYER")
                || role.equals("ROLE_RECRUITER")
                || role.equals("RECRUITER");
    }

    private boolean isAdmin(String role) {

        return role.equals("ROLE_ADMIN")
                || role.equals("ADMIN")
                || role.equals("ROLE_SUPER_ADMIN")
                || role.equals("SUPER_ADMIN");
    }
}