package com.job_portal.job.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.Interview;
import com.job_portal.job.service.InterviewService;

@RestController
@RequestMapping("/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;

    // =====================================================
    // CONSTRUCTOR INJECTION
    // =====================================================

    public InterviewController(
            InterviewService interviewService) {

        this.interviewService = interviewService;
    }

    // =====================================================
    // SCHEDULE INTERVIEW
    // POST /interviews/schedule/{applicationId}
    // =====================================================

    @PostMapping("/schedule/{applicationId}")
    public ResponseEntity<?> scheduleInterview(
            @PathVariable Long applicationId,
            @RequestBody Interview interview) {

        if (applicationId == null || applicationId <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid application ID is required.");
        }

        if (interview == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Interview details are required.");
        }

        Interview savedInterview =
                interviewService.scheduleInterview(
                        applicationId,
                        interview
                );

        if (savedInterview == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to schedule interview. "
                            + "Application may not exist, "
                            + "interview may already exist, "
                            + "or interview details are invalid."
                    );
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedInterview);
    }

    // =====================================================
    // GET INTERVIEW BY APPLICATION
    // GET /interviews/application/{applicationId}
    // =====================================================

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<?> getInterviewByApplication(
            @PathVariable Long applicationId) {

        if (applicationId == null || applicationId <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid application ID is required.");
        }

        Interview interview =
                interviewService.getInterview(applicationId);

        if (interview == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "No interview found for application ID "
                            + applicationId
                    );
        }

        return ResponseEntity.ok(interview);
    }

    // =====================================================
    // GET CANDIDATE INTERVIEWS
    // GET /interviews/candidate/{userId}
    // =====================================================

    @GetMapping("/candidate/{userId}")
    public ResponseEntity<?> getCandidateInterviews(
            @PathVariable Long userId) {

        if (userId == null || userId <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid user ID is required.");
        }

        List<Interview> interviews =
                interviewService.getCandidateInterviews(userId);

        return ResponseEntity.ok(interviews);
    }

    // =====================================================
    // GET EMPLOYER INTERVIEWS
    // GET /interviews/employer/{employerId}
    // =====================================================

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<?> getEmployerInterviews(
            @PathVariable Long employerId) {

        if (employerId == null || employerId <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid employer ID is required.");
        }

        List<Interview> interviews =
                interviewService.getEmployerInterviews(employerId);

        return ResponseEntity.ok(interviews);
    }

    // =====================================================
    // INTERVIEW ANALYTICS
    // =====================================================

    // -----------------------------------------------------
    // TOTAL SCHEDULED
    // GET /interviews/analytics/scheduled
    // -----------------------------------------------------

    @GetMapping("/analytics/scheduled")
    public ResponseEntity<Long> totalScheduled() {

        return ResponseEntity.ok(
                interviewService.totalScheduled()
        );
    }

    // -----------------------------------------------------
    // TOTAL COMPLETED
    // GET /interviews/analytics/completed
    // -----------------------------------------------------

    @GetMapping("/analytics/completed")
    public ResponseEntity<Long> totalCompleted() {

        return ResponseEntity.ok(
                interviewService.totalCompleted()
        );
    }

    // -----------------------------------------------------
    // TOTAL CANCELLED
    // GET /interviews/analytics/cancelled
    // -----------------------------------------------------

    @GetMapping("/analytics/cancelled")
    public ResponseEntity<Long> totalCancelled() {

        return ResponseEntity.ok(
                interviewService.totalCancelled()
        );
    }

    // =====================================================
    // GET ALL INTERVIEWS
    // GET /interviews
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Interview>> getAllInterviews() {

        return ResponseEntity.ok(
                interviewService.getAllInterviews()
        );
    }

    // =====================================================
    // GET INTERVIEW BY ID
    // GET /interviews/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getInterviewById(
            @PathVariable Long id) {

        if (id == null || id <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        Interview interview =
                interviewService.getInterviewById(id);

        if (interview == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Interview not found with ID "
                            + id
                    );
        }

        return ResponseEntity.ok(interview);
    }

    // =====================================================
    // UPDATE INTERVIEW
    // PUT /interviews/{id}
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInterview(
            @PathVariable Long id,
            @RequestBody Interview interview) {

        if (id == null || id <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        if (interview == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Interview details are required.");
        }

        Interview updatedInterview =
                interviewService.updateInterview(
                        id,
                        interview
                );

        if (updatedInterview == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to update interview. "
                            + "Check interview details and status."
                    );
        }

        return ResponseEntity.ok(updatedInterview);
    }

    // =====================================================
    // UPDATE INTERVIEW STATUS
    // PUT /interviews/{id}/status?status=COMPLETED
    // =====================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateInterviewStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        if (id == null || id <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        if (status == null ||
                status.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Interview status is required.");
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!normalizedStatus.equals("SCHEDULED") &&
                !normalizedStatus.equals("COMPLETED") &&
                !normalizedStatus.equals("CANCELLED")) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid interview status. "
                            + "Valid statuses are SCHEDULED, "
                            + "COMPLETED, and CANCELLED."
                    );
        }

        Interview updatedInterview =
                interviewService.updateInterviewStatus(
                        id,
                        normalizedStatus
                );

        if (updatedInterview == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to update interview status. "
                            + "Interview may not exist."
                    );
        }

        return ResponseEntity.ok(updatedInterview);
    }

    // =====================================================
    // CANCEL INTERVIEW
    // PUT /interviews/{id}/cancel
    // =====================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInterview(
            @PathVariable Long id) {

        if (id == null || id <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        Interview cancelledInterview =
                interviewService.cancelInterview(id);

        if (cancelledInterview == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to cancel interview. "
                            + "Interview may not exist "
                            + "or may already be completed."
                    );
        }

        return ResponseEntity.ok(cancelledInterview);
    }

    // =====================================================
    // COMPLETE INTERVIEW
    // PUT /interviews/{id}/complete
    // =====================================================

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeInterview(
            @PathVariable Long id) {

        if (id == null || id <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        Interview completedInterview =
                interviewService.completeInterview(id);

        if (completedInterview == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to complete interview. "
                            + "Interview may not exist "
                            + "or may already be cancelled."
                    );
        }

        return ResponseEntity.ok(completedInterview);
    }

    // =====================================================
    // DELETE INTERVIEW
    // DELETE /interviews/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInterview(
            @PathVariable Long id) {

        if (id == null || id <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        boolean deleted =
                interviewService.deleteInterview(id);

        if (!deleted) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Interview not found with ID "
                            + id
                    );
        }

        return ResponseEntity.ok(
                "Interview deleted successfully."
        );
    }
}