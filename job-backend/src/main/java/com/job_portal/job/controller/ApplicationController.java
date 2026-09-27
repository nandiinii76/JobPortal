package com.job_portal.job.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.Application;
import com.job_portal.job.service.ApplicationService;

@RestController
@RequestMapping("/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService) {

        this.applicationService = applicationService;
    }


    // =====================================================
    // APPLY FOR JOB
    // POST /applications/apply/{userId}/{jobId}
    // =====================================================

    @PostMapping("/apply/{userId}/{jobId}")
    public ResponseEntity<?> applyJob(
            @PathVariable Long userId,
            @PathVariable Long jobId) {

        if (userId == null || jobId == null) {

            return ResponseEntity
                    .badRequest()
                    .body("User ID and Job ID are required.");
        }

        Application application =
                applicationService.applyJob(
                        userId,
                        jobId
                );

        if (application == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Unable to apply for this job. "
                        + "The user may not be a job seeker, "
                        + "the job may not exist, "
                        + "or the job may already be applied for."
                    );
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(application);
    }


    // =====================================================
    // GET APPLICATION BY ID
    // GET /applications/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getApplication(
            @PathVariable Long id) {

        Application application =
                applicationService.getApplication(id);

        if (application == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Application not found.");
        }

        return ResponseEntity.ok(application);
    }


    // =====================================================
    // GET APPLICATIONS BY USER
    // GET /applications/user/{userId}
    // =====================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>>
            getApplicationsByUser(
                    @PathVariable Long userId) {

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsByUser(userId)
        );
    }


    // =====================================================
    // GET APPLICATIONS FOR JOB
    // GET /applications/job/{jobId}
    // =====================================================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>>
            getApplicationsByJob(
                    @PathVariable Long jobId) {

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsByJob(jobId)
        );
    }


    // =====================================================
    // GET APPLICATIONS BY EMPLOYER
    // GET /applications/employer/{employerId}
    // =====================================================

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<Application>>
            getApplicationsByEmployer(
                    @PathVariable Long employerId) {

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsByEmployer(
                                employerId
                        )
        );
    }


    // =====================================================
    // UPDATE APPLICATION STATUS
    //
    // PUT
    // /applications/{id}/status?status=SHORTLISTED
    // =====================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        if (status == null ||
                status.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Application status is required.");
        }

        Application updated =
                applicationService.updateStatus(
                        id,
                        status
                );

        if (updated == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        "Invalid application or application status."
                    );
        }

        return ResponseEntity.ok(updated);
    }


    // =====================================================
    // GET APPLICATIONS BY STATUS
    // GET /applications/status/{status}
    // =====================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Application>>
            getApplicationsByStatus(
                    @PathVariable String status) {

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsByStatus(status)
        );
    }


    // =====================================================
    // DELETE APPLICATION
    // DELETE /applications/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
            deleteApplication(
                    @PathVariable Long id) {

        boolean deleted =
                applicationService
                        .deleteApplication(id);

        if (!deleted) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                        "Application not found."
                    );
        }

        return ResponseEntity.ok(
                "Application deleted successfully."
        );
    }


    // =====================================================
    // TOTAL APPLICATIONS
    // GET /applications/count
    // =====================================================

    @GetMapping("/count")
    public ResponseEntity<Long>
            totalApplications() {

        return ResponseEntity.ok(
                applicationService
                        .totalApplications()
        );
    }


    // =====================================================
    // APPLICATION ANALYTICS
    // =====================================================

    @GetMapping("/analytics/pending")
    public ResponseEntity<Long>
            totalPending() {

        return ResponseEntity.ok(
                applicationService
                        .totalPending()
        );
    }


    @GetMapping("/analytics/shortlisted")
    public ResponseEntity<Long>
            totalShortlisted() {

        return ResponseEntity.ok(
                applicationService
                        .totalShortlisted()
        );
    }


    @GetMapping("/analytics/interview")
    public ResponseEntity<Long>
            totalInterview() {

        return ResponseEntity.ok(
                applicationService
                        .totalInterview()
        );
    }


    @GetMapping("/analytics/rejected")
    public ResponseEntity<Long>
            totalRejected() {

        return ResponseEntity.ok(
                applicationService
                        .totalRejected()
        );
    }


    @GetMapping("/analytics/hired")
    public ResponseEntity<Long>
            totalHired() {

        return ResponseEntity.ok(
                applicationService
                        .totalHired()
        );
    }


    // =====================================================
    // EMPLOYER APPLICATION COUNT
    //
    // GET
    // /applications/analytics/employer/{employerId}
    // =====================================================

    @GetMapping("/analytics/employer/{employerId}")
    public ResponseEntity<Long>
            employerApplicationCount(
                    @PathVariable Long employerId) {

        return ResponseEntity.ok(
                applicationService
                        .totalApplications(
                                employerId
                        )
        );
    }
}