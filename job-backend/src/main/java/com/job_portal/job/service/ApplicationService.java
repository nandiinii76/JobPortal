package com.job_portal.job.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.job_portal.job.model.Application;
import com.job_portal.job.model.Job;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.ApplicationRepository;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.UserRepository;

@Service
@Transactional
public class ApplicationService {

    @Autowired
    private ApplicationRepository appRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JobRepository jobRepo;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;


    // =====================================================
    // APPLY FOR JOB
    // =====================================================

    public Application applyJob(Long userId, Long jobId) {

        User user = userRepo.findById(userId).orElse(null);
        Job job = jobRepo.findById(jobId).orElse(null);

        if (user == null || job == null) {
            return null;
        }

        // =================================================
        // ONLY JOB SEEKER CAN APPLY
        // =================================================

        if (user.getRole() == null ||
                !"ROLE_JOB_SEEKER".equalsIgnoreCase(
                        user.getRole().trim())) {

            return null;
        }

        // =================================================
        // EMPLOYER CANNOT APPLY TO OWN JOB
        // =================================================

        if (job.getEmployer() != null &&
                job.getEmployer().getId() != null &&
                job.getEmployer().getId().equals(userId)) {

            return null;
        }

        // =================================================
        // PREVENT DUPLICATE APPLICATION
        // =================================================

        if (appRepo.existsByUserIdAndJobId(userId, jobId)) {
            return null;
        }

        // =================================================
        // CREATE APPLICATION
        // =================================================

        Application application = new Application();

        application.setUser(user);
        application.setJob(job);
        application.setStatus("APPLIED");

        Application saved = appRepo.save(application);

        // =================================================
        // NOTIFICATION
        // =================================================

        notificationService.createNotification(
                user.getId(),
                "You successfully applied for "
                        + safe(job.getTitle()),
                "APPLICATION"
        );

        // =================================================
        // EMAIL
        // =================================================

        sendApplicationEmail(
                user,
                job,
                "Application Submitted - "
                        + safe(job.getTitle()),
                """
                Your application has been submitted successfully.

                Job Title : %s
                Company   : %s
                Status    : APPLIED

                We will notify you when the employer
                updates your application status.
                """.formatted(
                        safe(job.getTitle()),
                        safe(job.getCompany())
                )
        );

        return saved;
    }


    // =====================================================
    // GET APPLICATION BY ID
    // =====================================================

    public Application getApplication(Long applicationId) {

        if (applicationId == null) {
            return null;
        }

        return appRepo.findById(applicationId)
                .orElse(null);
    }


    // =====================================================
    // APPLICATIONS BY USER
    // =====================================================

    public List<Application> getApplicationsByUser(
            Long userId) {

        if (userId == null) {
            return List.of();
        }

        return appRepo.findByUserId(userId);
    }


    // =====================================================
    // APPLICATIONS BY JOB
    // =====================================================

    public List<Application> getApplicationsByJob(
            Long jobId) {

        if (jobId == null) {
            return List.of();
        }

        return appRepo.findByJobId(jobId);
    }


    // =====================================================
    // APPLICATIONS BY EMPLOYER
    // =====================================================

    public List<Application> getApplicationsByEmployer(
            Long employerId) {

        if (employerId == null) {
            return List.of();
        }

        return appRepo.findByJobEmployerId(employerId);
    }


    // =====================================================
    // APPLICATIONS BY STATUS
    // =====================================================

    public List<Application> getApplicationsByStatus(
            String status) {

        if (status == null ||
                status.trim().isEmpty()) {

            return List.of();
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!isValidStatus(normalizedStatus)) {
            return List.of();
        }

        return appRepo.findByStatus(normalizedStatus);
    }


    // =====================================================
    // UPDATE APPLICATION STATUS
    // =====================================================

    public Application updateStatus(
            Long applicationId,
            String status) {

        // =================================================
        // FIND APPLICATION
        // =================================================

        Application application =
                appRepo.findById(applicationId)
                        .orElse(null);

        if (application == null) {
            return null;
        }

        // =================================================
        // VALIDATE STATUS
        // =================================================

        if (status == null ||
                status.trim().isEmpty()) {

            return null;
        }

        String newStatus =
                status.trim().toUpperCase();

        if (!isValidStatus(newStatus)) {
            return null;
        }

        // =================================================
        // GET OLD STATUS
        // =================================================

        String oldStatus =
                application.getStatus();

        if (oldStatus != null) {
            oldStatus = oldStatus.trim().toUpperCase();
        }

        // =================================================
        // NO CHANGE
        // =================================================

        if (newStatus.equals(oldStatus)) {
            return application;
        }

        // =================================================
        // UPDATE STATUS
        // =================================================

        application.setStatus(newStatus);

        Application updated =
                appRepo.save(application);

        // =================================================
        // GET USER + JOB
        // =================================================

        User user =
                application.getUser();

        Job job =
                application.getJob();

        if (user == null || job == null) {
            return updated;
        }

        // =================================================
        // CREATE STATUS MESSAGE
        // =================================================

        String message =
                createStatusMessage(
                        newStatus,
                        job.getTitle()
                );

        // =================================================
        // CREATE NOTIFICATION
        // =================================================

        notificationService.createNotification(
                user.getId(),
                message,
                "APPLICATION"
        );

        // =================================================
        // EMAIL
        // =================================================

        sendApplicationEmail(
                user,
                job,
                "Application Status Updated - "
                        + safe(job.getTitle()),
                """
                %s

                Job Title : %s
                Company   : %s
                Previous Status : %s
                Current Status  : %s
                """.formatted(
                        message,
                        safe(job.getTitle()),
                        safe(job.getCompany()),
                        safeStatus(oldStatus),
                        newStatus
                )
        );

        return updated;
    }


    // =====================================================
    // CREATE STATUS MESSAGE
    // =====================================================

    private String createStatusMessage(
            String status,
            String jobTitle) {

        String title =
                safe(jobTitle);

        return switch (status) {

            case "SHORTLISTED" ->
                    "Congratulations! You have been shortlisted for "
                    + title + ".";

            case "INTERVIEW" ->
                    "Your application for "
                    + title
                    + " has moved to the interview stage.";

            case "HIRED" ->
                    "Congratulations! You have been hired for "
                    + title + ".";

            case "REJECTED" ->
                    "Your application for "
                    + title
                    + " has been rejected.";

            case "APPLIED" ->
                    "Your application for "
                    + title
                    + " is now marked as APPLIED.";

            default ->
                    "Your application status for "
                    + title
                    + " has been updated to "
                    + status
                    + ".";
        };
    }


    // =====================================================
    // VALID STATUS
    // =====================================================

    private boolean isValidStatus(
            String status) {

        return "APPLIED".equals(status)
                || "SHORTLISTED".equals(status)
                || "INTERVIEW".equals(status)
                || "REJECTED".equals(status)
                || "HIRED".equals(status);
    }


    // =====================================================
    // DELETE APPLICATION
    // =====================================================

    public boolean deleteApplication(
            Long applicationId) {

        if (applicationId == null) {
            return false;
        }

        if (!appRepo.existsById(applicationId)) {
            return false;
        }

        appRepo.deleteById(applicationId);

        return true;
    }


    // =====================================================
    // EMPLOYER ANALYTICS
    // =====================================================

    public long totalApplications(
            Long employerId) {

        if (employerId == null) {
            return 0;
        }

        return appRepo.countApplicationsByEmployer(
                employerId
        );
    }


    // =====================================================
    // TOTAL APPLICATIONS
    // =====================================================

    public long totalApplications() {

        return appRepo.count();
    }


    // =====================================================
    // APPLIED APPLICATIONS
    // =====================================================

    public long totalPending() {

        return appRepo.countByStatus("APPLIED");
    }


    // =====================================================
    // SHORTLISTED APPLICATIONS
    // =====================================================

    public long totalShortlisted() {

        return appRepo.countByStatus("SHORTLISTED");
    }


    // =====================================================
    // INTERVIEW APPLICATIONS
    // =====================================================

    public long totalInterview() {

        return appRepo.countByStatus("INTERVIEW");
    }


    // =====================================================
    // REJECTED APPLICATIONS
    // =====================================================

    public long totalRejected() {

        return appRepo.countByStatus("REJECTED");
    }


    // =====================================================
    // HIRED APPLICATIONS
    // =====================================================

    public long totalHired() {

        return appRepo.countByStatus("HIRED");
    }


    // =====================================================
    // SEND APPLICATION EMAIL
    // =====================================================

    private void sendApplicationEmail(
            User user,
            Job job,
            String subject,
            String message) {

        if (user == null ||
                user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            return;
        }

        emailService.sendEmail(
                user.getEmail(),

                subject,

                """
                Dear %s,

                %s

                Regards,
                Job Portal Team
                """.formatted(
                        safe(user.getName()),
                        message
                )
        );
    }


    // =====================================================
    // SAFE STRING
    // =====================================================

    private String safe(String value) {

        return value == null ||
                value.trim().isEmpty()
                ? "N/A"
                : value;
    }


    // =====================================================
    // SAFE STATUS
    // =====================================================

    private String safeStatus(String status) {

        return status == null ||
                status.trim().isEmpty()
                ? "N/A"
                : status;
    }
}