package com.job_portal.job.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.job_portal.job.model.Application;
import com.job_portal.job.model.Interview;
import com.job_portal.job.repository.ApplicationRepository;
import com.job_portal.job.repository.InterviewRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // =====================================================
    // CONSTRUCTOR INJECTION
    // =====================================================

    public InterviewService(
            InterviewRepository interviewRepository,
            ApplicationRepository applicationRepository,
            EmailService emailService,
            NotificationService notificationService) {

        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    // =====================================================
    // SCHEDULE INTERVIEW
    // POST /interviews/schedule/{applicationId}
    // =====================================================

    public Interview scheduleInterview(
            Long applicationId,
            Interview interview) {

        if (applicationId == null || interview == null) {
            return null;
        }

        // -------------------------------------------------
        // FIND APPLICATION
        // -------------------------------------------------

        Application application =
                applicationRepository
                        .findById(applicationId)
                        .orElse(null);

        if (application == null) {
            return null;
        }

        // -------------------------------------------------
        // PREVENT DUPLICATE INTERVIEW
        // -------------------------------------------------

        if (interviewRepository.existsByApplicationId(applicationId)) {
            return null;
        }

        // -------------------------------------------------
        // VALIDATE INTERVIEW
        // -------------------------------------------------

        if (!isValidInterviewDetails(interview)) {
            return null;
        }

        // -------------------------------------------------
        // VALIDATE DATE
        // -------------------------------------------------

        if (interview.getInterviewDate().isBefore(LocalDate.now())) {
            return null;
        }

        // -------------------------------------------------
        // NORMALIZE MODE
        // -------------------------------------------------

        String mode =
                interview.getInterviewMode()
                        .trim()
                        .toUpperCase();

        interview.setInterviewMode(mode);

        // -------------------------------------------------
        // ONLINE
        // -------------------------------------------------

        if ("ONLINE".equals(mode)) {

            interview.setMeetingLink(
                    interview.getMeetingLink().trim()
            );

            interview.setLocation(null);
        }

        // -------------------------------------------------
        // OFFLINE
        // -------------------------------------------------

        if ("OFFLINE".equals(mode)) {

            interview.setLocation(
                    interview.getLocation().trim()
            );

            interview.setMeetingLink(null);
        }

        // -------------------------------------------------
        // INTERVIEWER
        // -------------------------------------------------

        interview.setInterviewerName(
                interview.getInterviewerName().trim()
        );

        // -------------------------------------------------
        // INTERVIEWER EMAIL
        // -------------------------------------------------

        if (interview.getInterviewerEmail() != null) {

            String interviewerEmail =
                    interview.getInterviewerEmail().trim();

            interview.setInterviewerEmail(
                    interviewerEmail.isEmpty()
                            ? null
                            : interviewerEmail
            );
        }

        // -------------------------------------------------
        // SET APPLICATION
        // -------------------------------------------------

        interview.setApplication(application);

        // -------------------------------------------------
        // INITIAL STATUS
        // -------------------------------------------------

        interview.setStatus("SCHEDULED");

        // -------------------------------------------------
        // UPDATE APPLICATION STATUS
        // -------------------------------------------------

        application.setStatus("INTERVIEW");

        applicationRepository.save(application);

        // -------------------------------------------------
        // SAVE INTERVIEW
        // -------------------------------------------------

        Interview savedInterview =
                interviewRepository.save(interview);

        // -------------------------------------------------
        // NOTIFICATION
        // -------------------------------------------------

        sendNotificationSafely(
                application,

                "Your interview for "
                        + getJobTitle(application)
                        + " has been scheduled.",

                "INTERVIEW"
        );

        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

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
    // GET INTERVIEW BY APPLICATION
    // GET /interviews/application/{applicationId}
    // =====================================================

    public Interview getInterview(
            Long applicationId) {

        if (applicationId == null) {
            return null;
        }

        return interviewRepository
                .findByApplicationId(applicationId)
                .orElse(null);
    }

    // =====================================================
    // GET INTERVIEW BY ID
    // GET /interviews/{id}
    // =====================================================

    public Interview getInterviewById(
            Long interviewId) {

        if (interviewId == null) {
            return null;
        }

        return interviewRepository
                .findById(interviewId)
                .orElse(null);
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
    // GET ALL INTERVIEWS
    // =====================================================

    public List<Interview> getAllInterviews() {

        return interviewRepository.findAll();
    }

    // =====================================================
    // UPDATE INTERVIEW
    // PUT /interviews/{id}
    // =====================================================

    public Interview updateInterview(
            Long interviewId,
            Interview updatedInterview) {

        if (interviewId == null ||
                updatedInterview == null) {

            return null;
        }

        // -------------------------------------------------
        // FIND EXISTING INTERVIEW
        // -------------------------------------------------

        Interview interview =
                interviewRepository
                        .findById(interviewId)
                        .orElse(null);

        if (interview == null) {
            return null;
        }

        // -------------------------------------------------
        // VALIDATE
        // -------------------------------------------------

        if (!isValidInterviewDetails(updatedInterview)) {
            return null;
        }

        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        if (updatedInterview
                .getInterviewDate()
                .isBefore(LocalDate.now())) {

            return null;
        }

        // -------------------------------------------------
        // MODE
        // -------------------------------------------------

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

        // -------------------------------------------------
        // ONLINE
        // -------------------------------------------------

        if ("ONLINE".equals(mode)) {

            interview.setMeetingLink(
                    updatedInterview
                            .getMeetingLink()
                            .trim()
            );

            interview.setLocation(null);
        }

        // -------------------------------------------------
        // OFFLINE
        // -------------------------------------------------

        if ("OFFLINE".equals(mode)) {

            interview.setLocation(
                    updatedInterview
                            .getLocation()
                            .trim()
            );

            interview.setMeetingLink(null);
        }

        // -------------------------------------------------
        // INTERVIEWER
        // -------------------------------------------------

        interview.setInterviewerName(
                updatedInterview
                        .getInterviewerName()
                        .trim()
        );

        // -------------------------------------------------
        // INTERVIEWER EMAIL
        // -------------------------------------------------

        if (updatedInterview.getInterviewerEmail() != null) {

            String email =
                    updatedInterview
                            .getInterviewerEmail()
                            .trim();

            interview.setInterviewerEmail(
                    email.isEmpty()
                            ? null
                            : email
            );

        } else {

            interview.setInterviewerEmail(null);
        }

        // -------------------------------------------------
        // NOTES
        // -------------------------------------------------

        interview.setNotes(
                updatedInterview.getNotes()
        );

        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        String currentStatus =
                normalizeStatus(
                        interview.getStatus()
                );

        String newStatus =
                currentStatus;

        if (updatedInterview.getStatus() != null &&
                !updatedInterview.getStatus()
                        .trim()
                        .isEmpty()) {

            newStatus =
                    normalizeStatus(
                            updatedInterview.getStatus()
                    );

            if (!isValidInterviewStatus(newStatus)) {
                return null;
            }

            // ---------------------------------------------
            // PREVENT COMPLETED -> CANCELLED
            // ---------------------------------------------

            if ("COMPLETED".equals(currentStatus) &&
                    "CANCELLED".equals(newStatus)) {

                return null;
            }

            // ---------------------------------------------
            // PREVENT CANCELLED -> COMPLETED
            // ---------------------------------------------

            if ("CANCELLED".equals(currentStatus) &&
                    "COMPLETED".equals(newStatus)) {

                return null;
            }

            interview.setStatus(newStatus);
        }

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        Interview savedInterview =
                interviewRepository.save(interview);

        // -------------------------------------------------
        // APPLICATION
        // -------------------------------------------------

        Application application =
                interview.getApplication();

        if (application == null) {
            return savedInterview;
        }

        // -------------------------------------------------
        // SYNCHRONIZE APPLICATION
        // -------------------------------------------------

        synchronizeApplicationStatus(
                application,
                newStatus
        );

        applicationRepository.save(application);

        // -------------------------------------------------
        // MESSAGE
        // -------------------------------------------------

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

        // -------------------------------------------------
        // NOTIFICATION
        // -------------------------------------------------

        sendNotificationSafely(
                application,
                message,
                "INTERVIEW"
        );

        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

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
    // UPDATE INTERVIEW STATUS
    // PUT /interviews/{id}/status?status=COMPLETED
    // =====================================================

    public Interview updateInterviewStatus(
            Long interviewId,
            String status) {

        if (interviewId == null ||
                status == null ||
                status.trim().isEmpty()) {

            return null;
        }

        // -------------------------------------------------
        // FIND INTERVIEW
        // -------------------------------------------------

        Interview interview =
                interviewRepository
                        .findById(interviewId)
                        .orElse(null);

        if (interview == null) {
            return null;
        }

        // -------------------------------------------------
        // NORMALIZE
        // -------------------------------------------------

        String normalizedStatus =
                normalizeStatus(status);

        // -------------------------------------------------
        // VALIDATE STATUS
        // -------------------------------------------------

        if (!isValidInterviewStatus(
                normalizedStatus)) {

            return null;
        }

        String currentStatus =
                normalizeStatus(
                        interview.getStatus()
                );

        // -------------------------------------------------
        // SAME STATUS
        // -------------------------------------------------

        if (currentStatus.equals(normalizedStatus)) {
            return interview;
        }

        // -------------------------------------------------
        // PREVENT INVALID TRANSITIONS
        // -------------------------------------------------

        if ("COMPLETED".equals(currentStatus) &&
                "CANCELLED".equals(normalizedStatus)) {

            return null;
        }

        if ("CANCELLED".equals(currentStatus) &&
                "COMPLETED".equals(normalizedStatus)) {

            return null;
        }

        // -------------------------------------------------
        // UPDATE
        // -------------------------------------------------

        interview.setStatus(
                normalizedStatus
        );

        Interview savedInterview =
                interviewRepository.save(interview);

        // -------------------------------------------------
        // APPLICATION
        // -------------------------------------------------

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

        // -------------------------------------------------
        // MESSAGE
        // -------------------------------------------------

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

        // -------------------------------------------------
        // NOTIFICATION
        // -------------------------------------------------

        sendNotificationSafely(
                application,
                message,
                "INTERVIEW"
        );

        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

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
    // CANCEL INTERVIEW
    // PUT /interviews/{id}/cancel
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

        // -------------------------------------------------
        // ALREADY CANCELLED
        // -------------------------------------------------

        if ("CANCELLED".equals(currentStatus)) {
            return interview;
        }

        // -------------------------------------------------
        // COMPLETED CANNOT BE CANCELLED
        // -------------------------------------------------

        if ("COMPLETED".equals(currentStatus)) {
            return null;
        }

        // -------------------------------------------------
        // CANCEL
        // -------------------------------------------------

        interview.setStatus("CANCELLED");

        Interview savedInterview =
                interviewRepository.save(interview);

        Application application =
                interview.getApplication();

        if (application != null) {

            application.setStatus("SHORTLISTED");

            applicationRepository.save(application);

            // -------------------------------------------------
            // NOTIFICATION
            // -------------------------------------------------

            sendNotificationSafely(
                    application,

                    "Your interview for "
                            + getJobTitle(application)
                            + " has been cancelled.",

                    "INTERVIEW"
            );

            // -------------------------------------------------
            // EMAIL
            // -------------------------------------------------

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
    // COMPLETE INTERVIEW
    // PUT /interviews/{id}/complete
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

        // -------------------------------------------------
        // ALREADY COMPLETED
        // -------------------------------------------------

        if ("COMPLETED".equals(currentStatus)) {
            return interview;
        }

        // -------------------------------------------------
        // CANCELLED CANNOT BE COMPLETED
        // -------------------------------------------------

        if ("CANCELLED".equals(currentStatus)) {
            return null;
        }

        // -------------------------------------------------
        // COMPLETE
        // -------------------------------------------------

        interview.setStatus("COMPLETED");

        Interview savedInterview =
                interviewRepository.save(interview);

        Application application =
                interview.getApplication();

        if (application == null) {
            return savedInterview;
        }

        // -------------------------------------------------
        // APPLICATION STATUS
        // -------------------------------------------------

        application.setStatus("INTERVIEW");

        applicationRepository.save(application);

        // -------------------------------------------------
        // NOTIFICATION
        // -------------------------------------------------

        sendNotificationSafely(
                application,

                "Your interview for "
                        + getJobTitle(application)
                        + " has been completed.",

                "INTERVIEW"
        );

        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

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
    // DELETE INTERVIEW
    // DELETE /interviews/{id}
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

        // -------------------------------------------------
        // DELETE
        // -------------------------------------------------

        interviewRepository.delete(interview);

        // -------------------------------------------------
        // RESET APPLICATION
        // -------------------------------------------------

        if (application != null &&
                "INTERVIEW".equalsIgnoreCase(
                        application.getStatus()
                )) {

            application.setStatus(
                    "SHORTLISTED"
            );

            applicationRepository.save(application);
        }

        return true;
    }

    // =====================================================
    // ANALYTICS
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

        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        if (interview.getInterviewDate() == null) {
            return false;
        }

        // -------------------------------------------------
        // TIME
        // -------------------------------------------------

        if (interview.getInterviewTime() == null) {
            return false;
        }

        // -------------------------------------------------
        // MODE
        // -------------------------------------------------

        if (interview.getInterviewMode() == null ||
                interview.getInterviewMode()
                        .trim()
                        .isEmpty()) {

            return false;
        }

        String mode =
                interview.getInterviewMode()
                        .trim()
                        .toUpperCase();

        if (!"ONLINE".equals(mode) &&
                !"OFFLINE".equals(mode)) {

            return false;
        }

        // -------------------------------------------------
        // INTERVIEWER
        // -------------------------------------------------

        if (interview.getInterviewerName() == null ||
                interview.getInterviewerName()
                        .trim()
                        .isEmpty()) {

            return false;
        }

        // -------------------------------------------------
        // ONLINE
        // -------------------------------------------------

        if ("ONLINE".equals(mode)) {

            if (interview.getMeetingLink() == null ||
                    interview.getMeetingLink()
                            .trim()
                            .isEmpty()) {

                return false;
            }
        }

        // -------------------------------------------------
        // OFFLINE
        // -------------------------------------------------

        if ("OFFLINE".equals(mode)) {

            if (interview.getLocation() == null ||
                    interview.getLocation()
                            .trim()
                            .isEmpty()) {

                return false;
            }
        }

        return true;
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
                application.setStatus("INTERVIEW");
                break;

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
    // GET JOB TITLE
    // =====================================================

    private String getJobTitle(
            Application application) {

        if (application == null ||
                application.getJob() == null) {

            return "Job Position";
        }

        String title =
                application
                        .getJob()
                        .getTitle();

        return title != null &&
                !title.trim().isEmpty()
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

            if (application == null ||
                    application.getUser() == null) {

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

            if (application == null ||
                    application.getUser() == null ||
                    interview == null) {

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
    // SEND INTERVIEW EMAIL
    // =====================================================

    private void sendInterviewEmail(
            Application application,
            Interview interview,
            String subject,
            String message) {

        if (application == null ||
                application.getUser() == null) {

            return;
        }

        // -------------------------------------------------
        // CANDIDATE NAME
        // -------------------------------------------------

        String candidateName =
                application
                        .getUser()
                        .getName() != null
                        ? application
                                .getUser()
                                .getName()
                        : "Candidate";

        // -------------------------------------------------
        // CANDIDATE EMAIL
        // -------------------------------------------------

        String candidateEmail =
                application
                        .getUser()
                        .getEmail();

        if (candidateEmail == null ||
                candidateEmail.trim().isEmpty()) {

            return;
        }

        // -------------------------------------------------
        // JOB
        // -------------------------------------------------

        String jobTitle =
                getJobTitle(application);

        // -------------------------------------------------
        // MEETING LINK
        // -------------------------------------------------

        String meetingLink =
                interview.getMeetingLink() != null
                        ? interview.getMeetingLink()
                        : "N/A";

        // -------------------------------------------------
        // LOCATION
        // -------------------------------------------------

        String location =
                interview.getLocation() != null
                        ? interview.getLocation()
                        : "N/A";

        // -------------------------------------------------
        // INTERVIEWER
        // -------------------------------------------------

        String interviewer =
                interview.getInterviewerName() != null
                        ? interview.getInterviewerName()
                        : "N/A";

        // -------------------------------------------------
        // INTERVIEWER EMAIL
        // -------------------------------------------------

        String interviewerEmail =
                interview.getInterviewerEmail() != null
                        ? interview.getInterviewerEmail()
                        : "N/A";

        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        String status =
                interview.getStatus() != null
                        ? interview.getStatus()
                        : "N/A";

        // -------------------------------------------------
        // SEND EMAIL
        // -------------------------------------------------

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