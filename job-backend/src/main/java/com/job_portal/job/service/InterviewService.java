package com.job_portal.job.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.job_portal.job.model.Application;
import com.job_portal.job.model.Interview;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.ApplicationRepository;
import com.job_portal.job.repository.InterviewRepository;
import com.job_portal.job.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public InterviewService(
            InterviewRepository interviewRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            EmailService emailService,
            NotificationService notificationService) {

        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    // =====================================================
    // GET USER BY EMAIL
    // =====================================================

    private User getUserByEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            return null;
        }

        return userRepository.findByEmail(
                email.trim().toLowerCase()
        );
    }

    // =====================================================
    // CHECK EMPLOYER OWNERSHIP
    // =====================================================

    private boolean employerOwnsApplication(
            Application application,
            String email) {

        if (application == null
                || application.getJob() == null
                || application.getJob().getEmployer() == null) {

            return false;
        }

        User employer = application.getJob().getEmployer();

        if (employer.getEmail() == null || email == null) {
            return false;
        }

        return employer.getEmail()
                .equalsIgnoreCase(email.trim());
    }

    // =====================================================
    // CHECK CANDIDATE OWNERSHIP
    // =====================================================

    private boolean candidateOwnsApplication(
            Application application,
            String email) {

        if (application == null
                || application.getUser() == null
                || application.getUser().getEmail() == null
                || email == null) {

            return false;
        }

        return application.getUser()
                .getEmail()
                .equalsIgnoreCase(email.trim());
    }

    // =====================================================
    // CHECK EMPLOYER OWNS INTERVIEW
    // =====================================================

    private boolean employerOwnsInterview(
            Interview interview,
            String email) {

        if (interview == null
                || interview.getApplication() == null) {

            return false;
        }

        return employerOwnsApplication(
                interview.getApplication(),
                email
        );
    }

    // =====================================================
    // CHECK CANDIDATE OWNS INTERVIEW
    // =====================================================

    private boolean candidateOwnsInterview(
            Interview interview,
            String email) {

        if (interview == null
                || interview.getApplication() == null) {

            return false;
        }

        return candidateOwnsApplication(
                interview.getApplication(),
                email
        );
    }

    // =====================================================
    // SCHEDULE INTERVIEW
    // =====================================================

    public Interview scheduleInterview(
            Long applicationId,
            Interview interview) {

        if (applicationId == null || interview == null) {
            return null;
        }

        Application application = applicationRepository
                .findById(applicationId)
                .orElse(null);

        if (application == null) {
            return null;
        }

        if (interviewRepository.existsByApplicationId(applicationId)) {
            return null;
        }

        if (!isValidInterviewDetails(interview)) {
            return null;
        }

        if (interview.getInterviewDate()
                .isBefore(LocalDate.now())) {

            return null;
        }

        String mode = interview.getInterviewMode()
                .trim()
                .toUpperCase();

        interview.setInterviewMode(mode);

        if ("ONLINE".equals(mode)) {

            interview.setMeetingLink(
                    interview.getMeetingLink().trim()
            );

            interview.setLocation(null);

        } else {

            interview.setLocation(
                    interview.getLocation().trim()
            );

            interview.setMeetingLink(null);
        }

        interview.setInterviewerName(
                interview.getInterviewerName().trim()
        );

        if (interview.getInterviewerEmail() != null) {

            String email =
                    interview.getInterviewerEmail().trim();

            interview.setInterviewerEmail(
                    email.isEmpty() ? null : email
            );
        }

        interview.setApplication(application);
        interview.setStatus("SCHEDULED");

        application.setStatus("INTERVIEW");
        applicationRepository.save(application);

        Interview savedInterview =
                interviewRepository.save(interview);

        sendNotificationSafely(
                application,
                "Your interview for "
                        + getJobTitle(application)
                        + " has been scheduled.",
                "INTERVIEW"
        );

        sendInterviewEmailSafely(
                application,
                savedInterview,
                "Interview Scheduled - "
                        + getJobTitle(application),
                "Your interview has been scheduled successfully."
        );

        return savedInterview;
    }

    // =====================================================
    // SECURED SCHEDULE INTERVIEW
    // =====================================================

    public Interview scheduleInterviewForEmployer(
            Long applicationId,
            Interview interview,
            String employerEmail) {

        if (applicationId == null
                || employerEmail == null
                || employerEmail.trim().isEmpty()) {

            return null;
        }

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElse(null);

        if (application == null) {
            return null;
        }

        if (!employerOwnsApplication(
                application,
                employerEmail)) {

            return null;
        }

        return scheduleInterview(
                applicationId,
                interview
        );
    }

    // =====================================================
    // GET INTERVIEW BY APPLICATION
    // =====================================================

    public Interview getInterview(Long applicationId) {

        if (applicationId == null) {
            return null;
        }

        return interviewRepository
                .findByApplicationId(applicationId)
                .orElse(null);
    }

    // =====================================================
    // SECURED GET INTERVIEW BY APPLICATION
    // =====================================================

    public Interview getInterviewForUser(
            Long applicationId,
            String email) {

        if (applicationId == null || email == null) {
            return null;
        }

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElse(null);

        if (application == null) {
            return null;
        }

        boolean allowed =
                candidateOwnsApplication(
                        application,
                        email
                )
                ||
                employerOwnsApplication(
                        application,
                        email
                );

        if (!allowed) {
            return null;
        }

        return getInterview(applicationId);
    }

    // =====================================================
    // GET INTERVIEW BY ID
    // =====================================================

    public Interview getInterviewById(Long interviewId) {

        if (interviewId == null) {
            return null;
        }

        return interviewRepository
                .findById(interviewId)
                .orElse(null);
    }

    // =====================================================
    // SECURED GET INTERVIEW BY ID
    // =====================================================

    public Interview getInterviewForUserById(
            Long interviewId,
            String email) {

        if (interviewId == null || email == null) {
            return null;
        }

        Interview interview =
                getInterviewById(interviewId);

        if (interview == null) {
            return null;
        }

        boolean allowed =
                candidateOwnsInterview(
                        interview,
                        email
                )
                ||
                employerOwnsInterview(
                        interview,
                        email
                );

        if (!allowed) {
            return null;
        }

        return interview;
    }

    // =====================================================
    // GET CANDIDATE INTERVIEWS
    // =====================================================

    public List<Interview> getCandidateInterviews(
            Long userId) {

        if (userId == null) {
            return List.of();
        }

        return interviewRepository
                .findByApplicationUserIdOrderByInterviewDateAscInterviewTimeAsc(
                        userId
                );
    }

    // =====================================================
    // SECURED CANDIDATE INTERVIEWS
    // =====================================================

    public List<Interview> getCandidateInterviewsForUser(
            String email) {

        User user = getUserByEmail(email);

        if (user == null) {
            return List.of();
        }

        return getCandidateInterviews(user.getId());
    }

    // =====================================================
    // GET EMPLOYER INTERVIEWS
    // =====================================================

    public List<Interview> getEmployerInterviews(
            Long employerId) {

        if (employerId == null) {
            return List.of();
        }

        return interviewRepository
                .findByApplicationJobEmployerIdOrderByInterviewDateAscInterviewTimeAsc(
                        employerId
                );
    }

    // =====================================================
    // SECURED EMPLOYER INTERVIEWS
    // =====================================================

    public List<Interview> getEmployerInterviewsForUser(
            String email) {

        User user = getUserByEmail(email);

        if (user == null) {
            return List.of();
        }

        return getEmployerInterviews(user.getId());
    }

    // =====================================================
    // GET ALL INTERVIEWS
    // ADMIN ONLY
    // =====================================================

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }

    // =====================================================
    // UPDATE INTERVIEW
    // =====================================================

    public Interview updateInterview(
            Long interviewId,
            Interview updatedInterview) {

        if (interviewId == null
                || updatedInterview == null) {

            return null;
        }

        Interview interview =
                interviewRepository
                        .findById(interviewId)
                        .orElse(null);

        if (interview == null) {
            return null;
        }

        if (!isValidInterviewDetails(updatedInterview)) {
            return null;
        }

        if (updatedInterview.getInterviewDate()
                .isBefore(LocalDate.now())) {

            return null;
        }

        String mode =
                updatedInterview
                        .getInterviewMode()
                        .trim()
                        .toUpperCase();

        interview.setInterviewDate(
                updatedInterview.getInterviewDate()
        );

        interview.setInterviewTime(
                updatedInterview.getInterviewTime()
        );

        interview.setInterviewMode(mode);

        if ("ONLINE".equals(mode)) {

            interview.setMeetingLink(
                    updatedInterview
                            .getMeetingLink()
                            .trim()
            );

            interview.setLocation(null);

        } else {

            interview.setLocation(
                    updatedInterview
                            .getLocation()
                            .trim()
            );

            interview.setMeetingLink(null);
        }

        interview.setInterviewerName(
                updatedInterview
                        .getInterviewerName()
                        .trim()
        );

        if (updatedInterview.getInterviewerEmail() != null) {

            String email =
                    updatedInterview
                            .getInterviewerEmail()
                            .trim();

            interview.setInterviewerEmail(
                    email.isEmpty() ? null : email
            );

        } else {
            interview.setInterviewerEmail(null);
        }

        interview.setNotes(
                updatedInterview.getNotes()
        );

        String currentStatus =
                normalizeStatus(
                        interview.getStatus()
                );

        String newStatus = currentStatus;

        if (updatedInterview.getStatus() != null
                && !updatedInterview.getStatus()
                        .trim()
                        .isEmpty()) {

            newStatus =
                    normalizeStatus(
                            updatedInterview.getStatus()
                    );

            if (!isValidInterviewStatus(newStatus)) {
                return null;
            }

            if ("COMPLETED".equals(currentStatus)
                    && "CANCELLED".equals(newStatus)) {
                return null;
            }

            if ("CANCELLED".equals(currentStatus)
                    && "COMPLETED".equals(newStatus)) {
                return null;
            }

            interview.setStatus(newStatus);
        }

        Interview savedInterview =
                interviewRepository.save(interview);

        Application application =
                interview.getApplication();

        if (application == null) {
            return savedInterview;
        }

        synchronizeApplicationStatus(
                application,
                newStatus
        );

        applicationRepository.save(application);

        String message;

        switch (newStatus) {

            case "CANCELLED":
                message =
                        "Your interview for "
                                + getJobTitle(application)
                                + " has been cancelled.";
                break;

            case "COMPLETED":
                message =
                        "Your interview for "
                                + getJobTitle(application)
                                + " has been completed.";
                break;

            case "SCHEDULED":
                message =
                        "Your interview for "
                                + getJobTitle(application)
                                + " has been updated.";
                break;

            default:
                message =
                        "Your interview has been updated.";
        }

        sendNotificationSafely(
                application,
                message,
                "INTERVIEW"
        );

        sendInterviewEmailSafely(
                application,
                savedInterview,
                "Interview Updated - "
                        + getJobTitle(application),
                message
        );

        return savedInterview;
    }

    // =====================================================
    // SECURED UPDATE INTERVIEW
    // =====================================================

    public Interview updateInterviewForEmployer(
            Long interviewId,
            Interview updatedInterview,
            String employerEmail) {

        if (interviewId == null
                || employerEmail == null) {

            return null;
        }

        Interview interview =
                getInterviewById(interviewId);

        if (interview == null) {
            return null;
        }

        if (!employerOwnsInterview(
                interview,
                employerEmail)) {

            return null;
        }

        return updateInterview(
                interviewId,
                updatedInterview
        );
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    public Interview updateInterviewStatus(
            Long interviewId,
            String status) {

        if (interviewId == null
                || status == null
                || status.trim().isEmpty()) {

            return null;
        }

        Interview interview =
                interviewRepository
                        .findById(interviewId)
                        .orElse(null);

        if (interview == null) {
            return null;
        }

        String normalizedStatus =
                normalizeStatus(status);

        if (!isValidInterviewStatus(
                normalizedStatus)) {

            return null;
        }

        String currentStatus =
                normalizeStatus(
                        interview.getStatus()
                );

        if (currentStatus.equals(normalizedStatus)) {
            return interview;
        }

        if ("COMPLETED".equals(currentStatus)
                && "CANCELLED".equals(normalizedStatus)) {
            return null;
        }

        if ("CANCELLED".equals(currentStatus)
                && "COMPLETED".equals(normalizedStatus)) {
            return null;
        }

        interview.setStatus(normalizedStatus);

        Interview savedInterview =
                interviewRepository.save(interview);

        Application application =
                interview.getApplication();

        if (application == null) {
            return savedInterview;
        }

        synchronizeApplicationStatus(
                application,
                normalizedStatus
        );

        applicationRepository.save(application);

        String message;

        switch (normalizedStatus) {

            case "SCHEDULED":
                message =
                        "Your interview for "
                                + getJobTitle(application)
                                + " is scheduled.";
                break;

            case "COMPLETED":
                message =
                        "Your interview for "
                                + getJobTitle(application)
                                + " has been completed.";
                break;

            case "CANCELLED":
                message =
                        "Your interview for "
                                + getJobTitle(application)
                                + " has been cancelled.";
                break;

            default:
                message =
                        "Your interview status has been updated.";
        }

        sendNotificationSafely(
                application,
                message,
                "INTERVIEW"
        );

        sendInterviewEmailSafely(
                application,
                savedInterview,
                "Interview Status Updated - "
                        + getJobTitle(application),
                message
        );

        return savedInterview;
    }

    // =====================================================
    // SECURED STATUS UPDATE
    // =====================================================

    public Interview updateInterviewStatusForEmployer(
            Long interviewId,
            String status,
            String employerEmail) {

        if (interviewId == null
                || employerEmail == null) {

            return null;
        }

        Interview interview =
                getInterviewById(interviewId);

        if (interview == null) {
            return null;
        }

        if (!employerOwnsInterview(
                interview,
                employerEmail)) {

            return null;
        }

        return updateInterviewStatus(
                interviewId,
                status
        );
    }

    // =====================================================
    // CANCEL
    // =====================================================

    public Interview cancelInterview(
            Long interviewId) {

        if (interviewId == null) {
            return null;
        }

        Interview interview =
                interviewRepository
                        .findById(interviewId)
                        .orElse(null);

        if (interview == null) {
            return null;
        }

        String currentStatus =
                normalizeStatus(
                        interview.getStatus()
                );

        if ("CANCELLED".equals(currentStatus)) {
            return interview;
        }

        if ("COMPLETED".equals(currentStatus)) {
            return null;
        }

        interview.setStatus("CANCELLED");

        Interview savedInterview =
                interviewRepository.save(interview);

        Application application =
                interview.getApplication();

        if (application != null) {

            application.setStatus("SHORTLISTED");

            applicationRepository.save(application);

            sendNotificationSafely(
                    application,
                    "Your interview for "
                            + getJobTitle(application)
                            + " has been cancelled.",
                    "INTERVIEW"
            );

            sendInterviewEmailSafely(
                    application,
                    savedInterview,
                    "Interview Cancelled - "
                            + getJobTitle(application),
                    "Your interview has been cancelled. "
                            + "We will notify you if it is rescheduled."
            );
        }

        return savedInterview;
    }

    // =====================================================
    // SECURED CANCEL
    // =====================================================

    public Interview cancelInterviewForEmployer(
            Long interviewId,
            String employerEmail) {

        Interview interview =
                getInterviewById(interviewId);

        if (interview == null
                || !employerOwnsInterview(
                        interview,
                        employerEmail)) {

            return null;
        }

        return cancelInterview(interviewId);
    }

    // =====================================================
    // COMPLETE
    // =====================================================

    public Interview completeInterview(
            Long interviewId) {

        if (interviewId == null) {
            return null;
        }

        Interview interview =
                interviewRepository
                        .findById(interviewId)
                        .orElse(null);

        if (interview == null) {
            return null;
        }

        String currentStatus =
                normalizeStatus(
                        interview.getStatus()
                );

        if ("COMPLETED".equals(currentStatus)) {
            return interview;
        }

        if ("CANCELLED".equals(currentStatus)) {
            return null;
        }

        interview.setStatus("COMPLETED");

        Interview savedInterview =
                interviewRepository.save(interview);

        Application application =
                interview.getApplication();

        if (application == null) {
            return savedInterview;
        }

        application.setStatus("INTERVIEW");

        applicationRepository.save(application);

        sendNotificationSafely(
                application,
                "Your interview for "
                        + getJobTitle(application)
                        + " has been completed.",
                "INTERVIEW"
        );

        sendInterviewEmailSafely(
                application,
                savedInterview,
                "Interview Completed - "
                        + getJobTitle(application),
                "Your interview has been completed. "
                        + "Our recruitment team will contact "
                        + "you regarding the next steps."
        );

        return savedInterview;
    }

    // =====================================================
    // SECURED COMPLETE
    // =====================================================

    public Interview completeInterviewForEmployer(
            Long interviewId,
            String employerEmail) {

        Interview interview =
                getInterviewById(interviewId);

        if (interview == null
                || !employerOwnsInterview(
                        interview,
                        employerEmail)) {

            return null;
        }

        return completeInterview(interviewId);
    }

    // =====================================================
    // DELETE
    // =====================================================

    public boolean deleteInterview(
            Long interviewId) {

        if (interviewId == null) {
            return false;
        }

        Interview interview =
                interviewRepository
                        .findById(interviewId)
                        .orElse(null);

        if (interview == null) {
            return false;
        }

        Application application =
                interview.getApplication();

        interviewRepository.delete(interview);

        if (application != null
                && "INTERVIEW".equalsIgnoreCase(
                        application.getStatus())) {

            application.setStatus("SHORTLISTED");

            applicationRepository.save(application);
        }

        return true;
    }

    // =====================================================
    // SECURED DELETE
    // =====================================================

    public boolean deleteInterviewForEmployer(
            Long interviewId,
            String employerEmail) {

        Interview interview =
                getInterviewById(interviewId);

        if (interview == null
                || !employerOwnsInterview(
                        interview,
                        employerEmail)) {

            return false;
        }

        return deleteInterview(interviewId);
    }

    // =====================================================
    // GLOBAL ANALYTICS
    // ADMIN ONLY
    // =====================================================

    public long totalScheduled() {

        return interviewRepository
                .countByStatus("SCHEDULED");
    }

    public long totalCompleted() {

        return interviewRepository
                .countByStatus("COMPLETED");
    }

    public long totalCancelled() {

        return interviewRepository
                .countByStatus("CANCELLED");
    }

    // =====================================================
    // VALIDATE INTERVIEW DETAILS
    // =====================================================

    private boolean isValidInterviewDetails(
            Interview interview) {

        if (interview == null) {
            return false;
        }

        if (interview.getInterviewDate() == null) {
            return false;
        }

        if (interview.getInterviewTime() == null) {
            return false;
        }

        if (interview.getInterviewMode() == null
                || interview.getInterviewMode()
                        .trim()
                        .isEmpty()) {

            return false;
        }

        String mode =
                interview.getInterviewMode()
                        .trim()
                        .toUpperCase();

        if (!"ONLINE".equals(mode)
                && !"OFFLINE".equals(mode)) {

            return false;
        }

        if (interview.getInterviewerName() == null
                || interview.getInterviewerName()
                        .trim()
                        .isEmpty()) {

            return false;
        }

        if ("ONLINE".equals(mode)) {

            return interview.getMeetingLink() != null
                    && !interview.getMeetingLink()
                            .trim()
                            .isEmpty();
        }

        return interview.getLocation() != null
                && !interview.getLocation()
                        .trim()
                        .isEmpty();
    }

    // =====================================================
    // VALIDATE STATUS
    // =====================================================

    private boolean isValidInterviewStatus(
            String status) {

        return "SCHEDULED".equals(status)
                || "COMPLETED".equals(status)
                || "CANCELLED".equals(status);
    }

    // =====================================================
    // NORMALIZE STATUS
    // =====================================================

    private String normalizeStatus(
            String status) {

        if (status == null) {
            return "";
        }

        return status
                .trim()
                .toUpperCase();
    }

    // =====================================================
    // SYNCHRONIZE APPLICATION STATUS
    // =====================================================

    private void synchronizeApplicationStatus(
            Application application,
            String interviewStatus) {

        if (application == null) {
            return;
        }

        switch (interviewStatus) {

            case "SCHEDULED":
            case "COMPLETED":
                application.setStatus("INTERVIEW");
                break;

            case "CANCELLED":
                application.setStatus("SHORTLISTED");
                break;

            default:
                break;
        }
    }

    // =====================================================
    // JOB TITLE
    // =====================================================

    private String getJobTitle(
            Application application) {

        if (application == null
                || application.getJob() == null) {

            return "Job Position";
        }

        String title =
                application
                        .getJob()
                        .getTitle();

        return title != null
                && !title.trim().isEmpty()
                ? title
                : "Job Position";
    }

    // =====================================================
    // SAFE NOTIFICATION
    // =====================================================

    private void sendNotificationSafely(
            Application application,
            String message,
            String type) {

        try {

            if (application == null
                    || application.getUser() == null) {

                return;
            }

            Long userId =
                    application
                            .getUser()
                            .getId();

            if (userId == null) {
                return;
            }

            notificationService.createNotification(
                    userId,
                    message,
                    type
            );

        } catch (Exception e) {

            System.err.println(
                    "Notification failed: "
                            + e.getMessage()
            );
        }
    }

    // =====================================================
    // SAFE EMAIL
    // =====================================================

    private void sendInterviewEmailSafely(
            Application application,
            Interview interview,
            String subject,
            String message) {

        try {

            if (application == null
                    || application.getUser() == null
                    || interview == null) {

                return;
            }

            sendInterviewEmail(
                    application,
                    interview,
                    subject,
                    message
            );

        } catch (Exception e) {

            System.err.println(
                    "Interview email failed: "
                            + e.getMessage()
            );
        }
    }

    // =====================================================
    // SEND EMAIL
    // =====================================================

    private void sendInterviewEmail(
            Application application,
            Interview interview,
            String subject,
            String message) {

        if (application == null
                || application.getUser() == null) {

            return;
        }

        String candidateName =
                application
                        .getUser()
                        .getName() != null
                        ? application
                                .getUser()
                                .getName()
                        : "Candidate";

        String candidateEmail =
                application
                        .getUser()
                        .getEmail();

        if (candidateEmail == null
                || candidateEmail.trim().isEmpty()) {

            return;
        }

        String jobTitle =
                getJobTitle(application);

        String meetingLink =
                interview.getMeetingLink() != null
                        ? interview.getMeetingLink()
                        : "N/A";

        String location =
                interview.getLocation() != null
                        ? interview.getLocation()
                        : "N/A";

        String interviewer =
                interview.getInterviewerName() != null
                        ? interview.getInterviewerName()
                        : "N/A";

        String interviewerEmail =
                interview.getInterviewerEmail() != null
                        ? interview.getInterviewerEmail()
                        : "N/A";

        String status =
                interview.getStatus() != null
                        ? interview.getStatus()
                        : "N/A";

        emailService.sendEmail(
                candidateEmail,
                subject,
                """
                Dear %s,

                %s

                ----------------------------------------
                INTERVIEW DETAILS
                ----------------------------------------

                Job Title         : %s
                Interview Date    : %s
                Interview Time    : %s
                Interview Mode    : %s
                Meeting Link      : %s
                Location          : %s
                Interviewer       : %s
                Interviewer Email : %s
                Status            : %s

                ----------------------------------------

                Regards,
                Job Portal Team
                """.formatted(
                        candidateName,
                        message,
                        jobTitle,
                        interview.getInterviewDate(),
                        interview.getInterviewTime(),
                        interview.getInterviewMode(),
                        meetingLink,
                        location,
                        interviewer,
                        interviewerEmail,
                        status
                )
        );
    }
}