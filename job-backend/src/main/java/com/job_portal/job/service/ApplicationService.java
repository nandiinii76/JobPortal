package com.job_portal.job.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.job_portal.job.dto.EmployerAnalyticsResponse;
import com.job_portal.job.model.Application;
import com.job_portal.job.model.Job;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.ApplicationRepository;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.UserRepository;

@Service
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            NotificationService notificationService,
            EmailService emailService) {

        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    // =====================================================
    // APPLY FOR JOB
    // =====================================================

    public Application applyJob(
            String userEmail,
            Long jobId) {

        String email = normalizeEmail(userEmail);

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        User user = findUserByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException(
                    "User not found"
            );
        }

        if (!isJobSeekerRole(user.getRole())) {
            throw new IllegalArgumentException(
                    "Only job seekers can apply for jobs"
            );
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Job not found with ID: " + jobId
                        )
                );

        if (job.getEmployer() != null
                && job.getEmployer().getId() != null
                && job.getEmployer().getId().equals(user.getId())) {

            throw new IllegalArgumentException(
                    "You cannot apply to your own job"
            );
        }

        if (applicationRepository
                .existsByUserIdAndJobId(user.getId(), jobId)) {

            throw new IllegalArgumentException(
                    "You have already applied for this job"
            );
        }

        Application application = new Application();

        application.setUser(user);
        application.setJob(job);
        application.setStatus("APPLIED");

        Application saved =
                applicationRepository.save(application);

        sendApplicationNotification(saved);
        sendApplicationEmail(saved);

        return saved;
    }

    // =====================================================
    // GET APPLICATION
    // =====================================================

    @Transactional(readOnly = true)
    public Application getApplication(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Application ID is required"
            );
        }

        return applicationRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Application not found with ID: " + id
                        )
                );
    }

    // =====================================================
    // GET APPLICATIONS FOR USER
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getApplicationsForUser(
            String email) {

        User user = findUserByEmail(
                normalizeEmail(email)
        );

        if (user == null) {
            throw new IllegalArgumentException(
                    "User not found"
            );
        }

        return applicationRepository.findByUserId(
                user.getId()
        );
    }

    // =====================================================
    // GET APPLICATIONS BY USER ID
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByUser(
            Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID is required"
            );
        }

        return applicationRepository.findByUserId(userId);
    }

    // =====================================================
    // GET APPLICATIONS BY JOB
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByJob(
            Long jobId) {

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        return applicationRepository.findByJobId(jobId);
    }

    // =====================================================
    // CHECK JOB OWNERSHIP
    // =====================================================

    @Transactional(readOnly = true)
    public boolean isJobOwnedByEmployer(
            Long jobId,
            String employerEmail) {

        if (jobId == null ||
                employerEmail == null ||
                employerEmail.trim().isEmpty()) {

            return false;
        }

        User employer =
                findUserByEmail(
                        normalizeEmail(employerEmail)
                );

        if (employer == null ||
                employer.getId() == null) {

            return false;
        }

        Job job =
                jobRepository.findById(jobId)
                        .orElse(null);

        if (job == null ||
                job.getEmployer() == null ||
                job.getEmployer().getId() == null) {

            return false;
        }

        return job.getEmployer()
                .getId()
                .equals(employer.getId());
    }

    // =====================================================
    // GET EMPLOYER APPLICATIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getApplicationsForEmployer(
            String employerEmail) {

        User employer =
                findUserByEmail(
                        normalizeEmail(employerEmail)
                );

        if (employer == null) {
            throw new IllegalArgumentException(
                    "Employer account not found"
            );
        }

        validateEmployerRole(employer);

        return applicationRepository
                .findByJobEmployerId(
                        employer.getId()
                );
    }

    // =====================================================
    // GET EMPLOYER APPLICATIONS BY STATUS
    // =====================================================

    @Transactional(readOnly = true)
    public List<Application> getApplicationsByEmployerAndStatus(
            String employerEmail,
            String status) {

        User employer =
                findUserByEmail(
                        normalizeEmail(employerEmail)
                );

        if (employer == null) {
            throw new IllegalArgumentException(
                    "Employer account not found"
            );
        }

        validateEmployerRole(employer);

        String normalizedStatus =
                normalizeStatus(status);

        return applicationRepository
                .findByJobEmployerIdAndStatus(
                        employer.getId(),
                        normalizedStatus
                );
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    public Application updateStatus(
            Long applicationId,
            String status) {

        Application application =
                getApplication(applicationId);

        String normalizedStatus =
                normalizeStatus(status);

        application.setStatus(normalizedStatus);

        Application saved =
                applicationRepository.save(application);

        sendStatusNotification(saved);
        sendStatusEmail(saved);

        return saved;
    }

    // =====================================================
    // UPDATE STATUS FOR EMPLOYER
    // =====================================================

    public Application updateStatusForEmployer(
            Long applicationId,
            String status,
            String employerEmail) {

        Application application =
                getApplication(applicationId);

        User employer =
                findUserByEmail(
                        normalizeEmail(employerEmail)
                );

        if (employer == null) {
            throw new IllegalArgumentException(
                    "Employer account not found"
            );
        }

        validateEmployerRole(employer);

        Job job = application.getJob();

        if (job == null ||
                job.getEmployer() == null ||
                job.getEmployer().getId() == null ||
                !job.getEmployer()
                        .getId()
                        .equals(employer.getId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to update this application"
            );
        }

        String normalizedStatus =
                normalizeStatus(status);

        application.setStatus(normalizedStatus);

        Application saved =
                applicationRepository.save(application);

        sendStatusNotification(saved);
        sendStatusEmail(saved);

        return saved;
    }

    // =====================================================
    // DELETE APPLICATION FOR USER
    // =====================================================

    public void deleteApplicationForUser(
            Long applicationId,
            String userEmail) {

        Application application =
                getApplication(applicationId);

        User user =
                findUserByEmail(
                        normalizeEmail(userEmail)
                );

        if (user == null) {
            throw new IllegalArgumentException(
                    "User not found"
            );
        }

        if (application.getUser() == null ||
                application.getUser().getId() == null ||
                !application.getUser()
                        .getId()
                        .equals(user.getId())) {

            throw new IllegalArgumentException(
                    "You are not authorized to delete this application"
            );
        }

        applicationRepository.delete(application);
    }

    // =====================================================
    // TOTAL APPLICATIONS
    // =====================================================

    @Transactional(readOnly = true)
    public long getTotalApplications() {

        return applicationRepository.count();
    }

    // =====================================================
    // COUNT BY STATUS
    // =====================================================

    @Transactional(readOnly = true)
    public long countByStatus(String status) {

        return applicationRepository.countByStatus(
                normalizeStatus(status)
        );
    }

    // =====================================================
    // EMPLOYER ANALYTICS
    // =====================================================

    @Transactional(readOnly = true)
    public EmployerAnalyticsResponse getEmployerAnalytics(
            String employerEmail) {

        User employer =
                findUserByEmail(
                        normalizeEmail(employerEmail)
                );

        if (employer == null) {
            throw new IllegalArgumentException(
                    "Employer account not found"
            );
        }

        validateEmployerRole(employer);

        Long employerId = employer.getId();

        long totalApplications =
                applicationRepository
                        .countByJobEmployerId(employerId);

        long applied =
                applicationRepository
                        .countByJobEmployerIdAndStatus(
                                employerId,
                                "APPLIED"
                        );

        long shortlisted =
                applicationRepository
                        .countByJobEmployerIdAndStatus(
                                employerId,
                                "SHORTLISTED"
                        );

        long interview =
                applicationRepository
                        .countByJobEmployerIdAndStatus(
                                employerId,
                                "INTERVIEW"
                        );

        long rejected =
                applicationRepository
                        .countByJobEmployerIdAndStatus(
                                employerId,
                                "REJECTED"
                        );

        long hired =
                applicationRepository
                        .countByJobEmployerIdAndStatus(
                                employerId,
                                "HIRED"
                        );

        return EmployerAnalyticsResponse.builder()
                .totalApplications(totalApplications)
                .applied(applied)
                .shortlisted(shortlisted)
                .interview(interview)
                .rejected(rejected)
                .hired(hired)
                .build();
    }

    // =====================================================
    // USER ID BY EMAIL
    // =====================================================

    @Transactional(readOnly = true)
    public Long getUserIdByEmail(String email) {

        User user =
                findUserByEmail(
                        normalizeEmail(email)
                );

        if (user == null) {
            throw new IllegalArgumentException(
                    "User not found"
            );
        }

        return user.getId();
    }

    // =====================================================
    // FIND USER
    // =====================================================

    private User findUserByEmail(String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            return null;
        }

        return userRepository.findByEmail(
                email.trim().toLowerCase(Locale.ROOT)
        );
    }

    // =====================================================
    // EMPLOYER ROLE VALIDATION
    // =====================================================

    private void validateEmployerRole(User user) {

        if (user == null ||
                user.getRole() == null) {

            throw new IllegalArgumentException(
                    "Only employers or recruiters can manage applications"
            );
        }

        String role =
                user.getRole()
                        .trim()
                        .toUpperCase(Locale.ROOT);

        if (!role.equals("ROLE_EMPLOYER")
                && !role.equals("EMPLOYER")
                && !role.equals("ROLE_RECRUITER")
                && !role.equals("RECRUITER")) {

            throw new IllegalArgumentException(
                    "Only employers or recruiters can manage applications"
            );
        }
    }

    // =====================================================
    // JOB SEEKER ROLE
    // =====================================================

    private boolean isJobSeekerRole(String role) {

        if (role == null) {
            return false;
        }

        String normalized =
                role.trim()
                        .toUpperCase(Locale.ROOT);

        return normalized.equals("ROLE_JOB_SEEKER")
                || normalized.equals("JOB_SEEKER")
                || normalized.equals("ROLE_USER")
                || normalized.equals("USER")
                || normalized.equals("ROLE_CANDIDATE")
                || normalized.equals("CANDIDATE");
    }

    // =====================================================
    // STATUS NORMALIZATION
    // =====================================================

    private String normalizeStatus(String status) {

        if (status == null ||
                status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Application status is required"
            );
        }

        String normalized =
                status.trim()
                        .toUpperCase(Locale.ROOT);

        if (!isValidStatus(normalized)) {

            throw new IllegalArgumentException(
                    "Invalid application status: " + status
            );
        }

        return normalized;
    }

    // =====================================================
    // VALID STATUS
    // =====================================================

    private boolean isValidStatus(String status) {

        return status.equals("APPLIED")
                || status.equals("SHORTLISTED")
                || status.equals("INTERVIEW")
                || status.equals("REJECTED")
                || status.equals("HIRED");
    }

    // =====================================================
    // APPLICATION NOTIFICATION
    // =====================================================

    private void sendApplicationNotification(
            Application application) {

        try {
            if (application == null ||
                    application.getJob() == null ||
                    application.getJob().getEmployer() == null ||
                    application.getJob().getEmployer().getId() == null) {
                return;
            }

            notificationService.createNotification(
                    application.getJob()
                            .getEmployer()
                            .getId(),
                    "NEW_APPLICATION",
                    "New application received for "
                            + safe(application.getJob().getTitle())
            );

        } catch (Exception ignored) {
            // Notification failure should not prevent
            // successful application creation.
        }
    }

    // =====================================================
    // STATUS NOTIFICATION
    // =====================================================

    private void sendStatusNotification(
            Application application) {

        try {
            if (application == null ||
                    application.getUser() == null ||
                    application.getUser().getId() == null) {
                return;
            }

            notificationService.createNotification(
                    application.getUser().getId(),
                    "APPLICATION_STATUS",
                    "Your application status is now "
                            + safeStatus(application.getStatus())
            );

        } catch (Exception ignored) {
            // Notification failure should not break
            // application status update.
        }
    }

    // =====================================================
    // APPLICATION EMAIL
    // =====================================================

    private void sendApplicationEmail(
            Application application) {

        try {
            if (application == null ||
                    application.getUser() == null ||
                    application.getUser().getEmail() == null) {
                return;
            }

            emailService.sendEmail(
                    application.getUser().getEmail(),
                    "Job Application Submitted",
                    "Your application for "
                            + safe(application.getJob() != null
                                    ? application.getJob().getTitle()
                                    : "the job")
                            + " has been submitted successfully."
            );

        } catch (Exception ignored) {
            // Email failure should not prevent
            // application creation.
        }
    }

    // =====================================================
    // STATUS EMAIL
    // =====================================================

    private void sendStatusEmail(
            Application application) {

        try {
            if (application == null ||
                    application.getUser() == null ||
                    application.getUser().getEmail() == null) {
                return;
            }

            emailService.sendEmail(
                    application.getUser().getEmail(),
                    "Application Status Updated",
                    "Your application status has been updated to "
                            + safeStatus(application.getStatus())
            );

        } catch (Exception ignored) {
            // Email failure should not break
            // application status update.
        }
    }

    // =====================================================
    // EMAIL NORMALIZATION
    // =====================================================

    private String normalizeEmail(String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Authenticated user is required"
            );
        }

        return email.trim()
                .toLowerCase(Locale.ROOT);
    }

    // =====================================================
    // SAFE TEXT
    // =====================================================

    private String safe(String value) {

        if (value == null ||
                value.trim().isEmpty()) {

            return "Job";
        }

        return value.trim();
    }

    // =====================================================
    // SAFE STATUS
    // =====================================================

    private String safeStatus(String status) {

        if (status == null ||
                status.trim().isEmpty()) {

            return "UPDATED";
        }

        return status.trim()
                .toUpperCase(Locale.ROOT);
    }
}