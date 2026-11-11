package com.job_portal.job.controller;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.service.AnalyticsService;
import com.job_portal.job.service.ApplicationService;
import com.job_portal.job.service.JobService;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ApplicationService applicationService;
    private final JobService jobService;

    public AnalyticsController(
            AnalyticsService analyticsService,
            ApplicationService applicationService,
            JobService jobService) {

        this.analyticsService = analyticsService;
        this.applicationService = applicationService;
        this.jobService = jobService;
    }

    // =====================================================
    // EMPLOYER DASHBOARD ANALYTICS
    // GET /analytics/employer/{employerId}
    // =====================================================

    @GetMapping("/employer/{employerId}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<?> getEmployerAnalytics(
            @PathVariable Long employerId,
            Authentication authentication) {

        if (!isAuthenticated(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication is required.");
        }

        if (employerId == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Employer ID is required.");
        }

        Long authenticatedEmployerId =
                getAuthenticatedUserId(authentication);

        if (authenticatedEmployerId == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Authenticated user could not be found.");
        }

        if (!authenticatedEmployerId.equals(employerId)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to view this analytics data."
                    );
        }

        long totalJobs =
                analyticsService.getTotalJobs(employerId);

        long totalApplications =
                analyticsService.getTotalApplications(employerId);

        Map<String, Long> analytics =
                new HashMap<>();

        analytics.put("totalJobs", totalJobs);
        analytics.put("totalApplications", totalApplications);

        return ResponseEntity.ok(analytics);
    }

    // =====================================================
    // APPLICATION COUNT FOR A SPECIFIC JOB
    // GET /analytics/job/{jobId}/applications
    // =====================================================

    @GetMapping("/job/{jobId}/applications")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<?> getApplicationsForJob(
            @PathVariable Long jobId,
            Authentication authentication) {

        if (!isAuthenticated(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication is required.");
        }

        if (jobId == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Job ID is required.");
        }

        String employerEmail =
                authentication
                        .getName()
                        .trim()
                        .toLowerCase(Locale.ROOT);

        // -------------------------------------------------
        // CHECK JOB EXISTS
        // -------------------------------------------------

        Long jobOwnerId =
                jobService.getJobOwnerId(jobId);

        if (jobOwnerId == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Job not found.");
        }

        // -------------------------------------------------
        // CHECK JOB OWNERSHIP
        // -------------------------------------------------

        if (!jobService.isJobOwnedBy(
                jobId,
                employerEmail)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to view analytics for this job."
                    );
        }

        // -------------------------------------------------
        // GET APPLICATION COUNT
        // -------------------------------------------------

        long applicationCount =
                analyticsService.getApplicationsForJob(jobId);

        return ResponseEntity.ok(applicationCount);
    }

    // =====================================================
    // GET AUTHENTICATED USER ID
    // =====================================================

    private Long getAuthenticatedUserId(
            Authentication authentication) {

        if (!isAuthenticated(authentication)) {
            return null;
        }

        return applicationService.getUserIdByEmail(
                authentication
                        .getName()
                        .trim()
                        .toLowerCase(Locale.ROOT)
        );
    }

    // =====================================================
    // AUTHENTICATION CHECK
    // =====================================================

    private boolean isAuthenticated(
            Authentication authentication) {

        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getName() != null
                && !authentication
                        .getName()
                        .trim()
                        .isEmpty();
    }
}