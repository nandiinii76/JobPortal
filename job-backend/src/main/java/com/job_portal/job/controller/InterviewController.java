package com.job_portal.job.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.Application;
import com.job_portal.job.model.Interview;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.ApplicationRepository;
import com.job_portal.job.repository.UserRepository;
import com.job_portal.job.service.InterviewService;

@RestController
@RequestMapping("/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public InterviewController(
            InterviewService interviewService,
            UserRepository userRepository,
            ApplicationRepository applicationRepository) {

        this.interviewService = interviewService;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    // =====================================================
    // CURRENT USER
    // =====================================================

    private User getCurrentUser(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return null;
        }

        String email = authentication.getName();

        if (email == null || email.trim().isEmpty()) {
            return null;
        }

        return userRepository.findByEmail(
                email.trim().toLowerCase()
        );
    }

    // =====================================================
    // CURRENT USER EMAIL
    // =====================================================

    private String getCurrentEmail(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return null;
        }

        String email = authentication.getName();

        if (email == null || email.trim().isEmpty()) {
            return null;
        }

        return email.trim().toLowerCase();
    }

    // =====================================================
    // ROLE CHECK
    // =====================================================

    private boolean hasRole(
            Authentication authentication,
            String role) {

        if (authentication == null ||
                authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        role.equals(
                                authority.getAuthority()
                        )
                );
    }

    // =====================================================
    // ADMIN
    // =====================================================

    private boolean isAdmin(Authentication authentication) {
        return hasRole(authentication, "ROLE_ADMIN");
    }

    // =====================================================
    // EMPLOYER
    // =====================================================

    private boolean isEmployer(Authentication authentication) {
        return hasRole(authentication, "ROLE_EMPLOYER");
    }

    // =====================================================
    // RECRUITER
    // =====================================================

    private boolean isRecruiter(Authentication authentication) {
        return hasRole(authentication, "ROLE_RECRUITER");
    }

    // =====================================================
    // CANDIDATE
    // =====================================================

    private boolean isCandidate(Authentication authentication) {
        return hasRole(authentication, "ROLE_JOB_SEEKER");
    }

    // =====================================================
    // EMPLOYER / RECRUITER
    // =====================================================

    private boolean isEmployerOrRecruiter(
            Authentication authentication) {

        return isEmployer(authentication) ||
                isRecruiter(authentication);
    }

    // =====================================================
    // APPLICATION OWNERSHIP
    // =====================================================

    private boolean employerOwnsApplication(
            Application application,
            User currentUser) {

        if (application == null ||
                currentUser == null ||
                application.getJob() == null ||
                application.getJob().getEmployer() == null) {

            return false;
        }

        User employer =
                application.getJob().getEmployer();

        return employer.getId() != null &&
                employer.getId().equals(
                        currentUser.getId()
                );
    }

    // =====================================================
    // INTERVIEW OWNERSHIP
    // =====================================================

    private boolean employerOwnsInterview(
            Interview interview,
            User currentUser) {

        if (interview == null ||
                currentUser == null ||
                interview.getApplication() == null ||
                interview.getApplication().getJob() == null ||
                interview.getApplication()
                        .getJob()
                        .getEmployer() == null) {

            return false;
        }

        User employer =
                interview.getApplication()
                        .getJob()
                        .getEmployer();

        return employer.getId() != null &&
                employer.getId().equals(
                        currentUser.getId()
                );
    }

    // =====================================================
    // CANDIDATE OWNERSHIP
    // =====================================================

    private boolean candidateOwnsInterview(
            Interview interview,
            User currentUser) {

        if (interview == null ||
                currentUser == null ||
                interview.getApplication() == null ||
                interview.getApplication().getUser() == null) {

            return false;
        }

        User candidate =
                interview.getApplication().getUser();

        return candidate.getId() != null &&
                candidate.getId().equals(
                        currentUser.getId()
                );
    }

    // =====================================================
    // SCHEDULE INTERVIEW
    //
    // POST /interviews/schedule/{applicationId}
    // =====================================================

    @PostMapping("/schedule/{applicationId}")
    public ResponseEntity<?> scheduleInterview(
            @PathVariable Long applicationId,
            @RequestBody Interview interview,
            Authentication authentication) {

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

        User currentUser =
                getCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found.");
        }

        if (!isEmployerOrRecruiter(authentication) &&
                !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Only employers, recruiters, or admins " +
                            "can schedule interviews."
                    );
        }

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElse(null);

        if (application == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Application not found.");
        }

        // Admin can manage any application.
        if (isAdmin(authentication)) {

            Interview savedInterview =
                    interviewService.scheduleInterview(
                            applicationId,
                            interview
                    );

            if (savedInterview == null) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                "Unable to schedule interview. " +
                                "Interview may already exist or " +
                                "interview details are invalid."
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedInterview);
        }

        // Employer/recruiter must own the job.
        if (!employerOwnsApplication(
                application,
                currentUser)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to schedule " +
                            "an interview for this application."
                    );
        }

        String email =
                getCurrentEmail(authentication);

        Interview savedInterview =
                interviewService.scheduleInterviewForEmployer(
                        applicationId,
                        interview,
                        email
                );

        if (savedInterview == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to schedule interview. " +
                            "Interview may already exist or " +
                            "interview details are invalid."
                    );
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedInterview);
    }

    // =====================================================
    // GET INTERVIEW BY APPLICATION
    //
    // GET /interviews/application/{applicationId}
    // =====================================================

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<?> getInterviewByApplication(
            @PathVariable Long applicationId,
            Authentication authentication) {

        if (applicationId == null || applicationId <= 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Valid application ID is required.");
        }

        User currentUser =
                getCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found.");
        }

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElse(null);

        if (application == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Application not found.");
        }

        boolean allowed = false;

        if (isAdmin(authentication)) {
            allowed = true;
        }

        if (isCandidate(authentication) &&
                application.getUser() != null &&
                currentUser.getId().equals(
                        application.getUser().getId()
                )) {

            allowed = true;
        }

        if (isEmployerOrRecruiter(authentication) &&
                employerOwnsApplication(
                        application,
                        currentUser)) {

            allowed = true;
        }

        if (!allowed) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to view " +
                            "this interview."
                    );
        }

        Interview interview;

        if (isAdmin(authentication)) {

            interview =
                    interviewService.getInterview(
                            applicationId
                    );

        } else {

            interview =
                    interviewService.getInterviewForUser(
                            applicationId,
                            getCurrentEmail(authentication)
                    );
        }

        if (interview == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "No interview found for application ID " +
                            applicationId
                    );
        }

        return ResponseEntity.ok(interview);
    }

    // =====================================================
    // GET CURRENT CANDIDATE INTERVIEWS
    //
    // GET /interviews/candidate
    // =====================================================

    @GetMapping("/candidate")
    public ResponseEntity<?> getCandidateInterviews(
            Authentication authentication) {

        if (!isCandidate(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Only job seekers can view " +
                            "candidate interviews."
                    );
        }

        String email =
                getCurrentEmail(authentication);

        if (email == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found.");
        }

        List<Interview> interviews =
                interviewService.getCandidateInterviewsForUser(
                        email
                );

        return ResponseEntity.ok(interviews);
    }

    // =====================================================
    // GET CURRENT EMPLOYER / RECRUITER INTERVIEWS
    //
    // GET /interviews/employer
    // =====================================================

    @GetMapping("/employer")
    public ResponseEntity<?> getEmployerInterviews(
            Authentication authentication) {

        if (!isEmployerOrRecruiter(authentication) &&
                !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to view " +
                            "employer interviews."
                    );
        }

        // Admin can see everything.
        if (isAdmin(authentication)) {

            return ResponseEntity.ok(
                    interviewService.getAllInterviews()
            );
        }

        String email =
                getCurrentEmail(authentication);

        if (email == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found.");
        }

        List<Interview> interviews =
                interviewService.getEmployerInterviewsForUser(
                        email
                );

        return ResponseEntity.ok(interviews);
    }

    // =====================================================
    // TOTAL SCHEDULED
    //
    // GET /interviews/analytics/scheduled
    // =====================================================

    @GetMapping("/analytics/scheduled")
    public ResponseEntity<?> totalScheduled(
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Only admins can view interview analytics."
                    );
        }

        return ResponseEntity.ok(
                interviewService.totalScheduled()
        );
    }

    // =====================================================
    // TOTAL COMPLETED
    //
    // GET /interviews/analytics/completed
    // =====================================================

    @GetMapping("/analytics/completed")
    public ResponseEntity<?> totalCompleted(
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Only admins can view interview analytics."
                    );
        }

        return ResponseEntity.ok(
                interviewService.totalCompleted()
        );
    }

    // =====================================================
    // TOTAL CANCELLED
    //
    // GET /interviews/analytics/cancelled
    // =====================================================

    @GetMapping("/analytics/cancelled")
    public ResponseEntity<?> totalCancelled(
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Only admins can view interview analytics."
                    );
        }

        return ResponseEntity.ok(
                interviewService.totalCancelled()
        );
    }

    // =====================================================
    // GET ALL INTERVIEWS
    //
    // GET /interviews
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getAllInterviews(
            Authentication authentication) {

        if (!isAdmin(authentication)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Only admins can view all interviews."
                    );
        }

        return ResponseEntity.ok(
                interviewService.getAllInterviews()
        );
    }

    // =====================================================
    // GET INTERVIEW BY ID
    //
    // GET /interviews/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getInterviewById(
            @PathVariable Long id,
            Authentication authentication) {

        if (id == null || id <= 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        User currentUser =
                getCurrentUser(authentication);

        if (currentUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authenticated user not found.");
        }

        // Admin can view everything.
        if (isAdmin(authentication)) {

            Interview interview =
                    interviewService.getInterviewById(id);

            if (interview == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Interview not found with ID " + id
                        );
            }

            return ResponseEntity.ok(interview);
        }

        String email =
                getCurrentEmail(authentication);

        Interview interview =
                interviewService.getInterviewForUserById(
                        id,
                        email
                );

        if (interview == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Interview not found or you are " +
                            "not authorized to view it."
                    );
        }

        return ResponseEntity.ok(interview);
    }

    // =====================================================
    // UPDATE INTERVIEW
    //
    // PUT /interviews/{id}
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInterview(
            @PathVariable Long id,
            @RequestBody Interview interview,
            Authentication authentication) {

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

        if (!isEmployerOrRecruiter(authentication) &&
                !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to update interviews."
                    );
        }

        // Admin can update everything.
        if (isAdmin(authentication)) {

            Interview updatedInterview =
                    interviewService.updateInterview(
                            id,
                            interview
                    );

            if (updatedInterview == null) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                "Unable to update interview. " +
                                "Check interview details."
                        );
            }

            return ResponseEntity.ok(updatedInterview);
        }

        String email =
                getCurrentEmail(authentication);

        Interview updatedInterview =
                interviewService.updateInterviewForEmployer(
                        id,
                        interview,
                        email
                );

        if (updatedInterview == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Interview not found or you are " +
                            "not authorized to update it."
                    );
        }

        return ResponseEntity.ok(updatedInterview);
    }

    // =====================================================
    // UPDATE INTERVIEW STATUS
    //
    // PUT /interviews/{id}/status?status=COMPLETED
    // =====================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateInterviewStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {

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
                            "Invalid interview status. " +
                            "Valid statuses are SCHEDULED, " +
                            "COMPLETED, and CANCELLED."
                    );
        }

        if (!isEmployerOrRecruiter(authentication) &&
                !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to update " +
                            "interview status."
                    );
        }

        // Admin
        if (isAdmin(authentication)) {

            Interview updatedInterview =
                    interviewService.updateInterviewStatus(
                            id,
                            normalizedStatus
                    );

            if (updatedInterview == null) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                "Unable to update interview status."
                        );
            }

            return ResponseEntity.ok(updatedInterview);
        }

        // Employer / Recruiter
        String email =
                getCurrentEmail(authentication);

        Interview updatedInterview =
                interviewService.updateInterviewStatusForEmployer(
                        id,
                        normalizedStatus,
                        email
                );

        if (updatedInterview == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Interview not found or you are " +
                            "not authorized to update its status."
                    );
        }

        return ResponseEntity.ok(updatedInterview);
    }

    // =====================================================
    // CANCEL INTERVIEW
    //
    // PUT /interviews/{id}/cancel
    // =====================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInterview(
            @PathVariable Long id,
            Authentication authentication) {

        if (id == null || id <= 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        if (!isEmployerOrRecruiter(authentication) &&
                !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to cancel interviews."
                    );
        }

        Interview cancelledInterview;

        if (isAdmin(authentication)) {

            cancelledInterview =
                    interviewService.cancelInterview(id);

        } else {

            cancelledInterview =
                    interviewService.cancelInterviewForEmployer(
                            id,
                            getCurrentEmail(authentication)
                    );
        }

        if (cancelledInterview == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to cancel interview. " +
                            "Interview may not exist or " +
                            "may already be completed."
                    );
        }

        return ResponseEntity.ok(cancelledInterview);
    }

    // =====================================================
    // COMPLETE INTERVIEW
    //
    // PUT /interviews/{id}/complete
    // =====================================================

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeInterview(
            @PathVariable Long id,
            Authentication authentication) {

        if (id == null || id <= 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        if (!isEmployerOrRecruiter(authentication) &&
                !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to complete interviews."
                    );
        }

        Interview completedInterview;

        if (isAdmin(authentication)) {

            completedInterview =
                    interviewService.completeInterview(id);

        } else {

            completedInterview =
                    interviewService.completeInterviewForEmployer(
                            id,
                            getCurrentEmail(authentication)
                    );
        }

        if (completedInterview == null) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            "Unable to complete interview. " +
                            "Interview may not exist or " +
                            "may already be cancelled."
                    );
        }

        return ResponseEntity.ok(completedInterview);
    }

    // =====================================================
    // DELETE INTERVIEW
    //
    // DELETE /interviews/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInterview(
            @PathVariable Long id,
            Authentication authentication) {

        if (id == null || id <= 0) {
            return ResponseEntity
                    .badRequest()
                    .body("Valid interview ID is required.");
        }

        if (!isEmployerOrRecruiter(authentication) &&
                !isAdmin(authentication)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not authorized to delete interviews."
                    );
        }

        boolean deleted;

        if (isAdmin(authentication)) {

            deleted =
                    interviewService.deleteInterview(id);

        } else {

            deleted =
                    interviewService.deleteInterviewForEmployer(
                            id,
                            getCurrentEmail(authentication)
                    );
        }

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Interview not found or you are " +
                            "not authorized to delete it."
                    );
        }

        return ResponseEntity.ok(
                "Interview deleted successfully."
        );
    }
}