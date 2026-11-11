package com.job_portal.job.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.job_portal.job.model.Job;
import com.job_portal.job.model.SavedJob;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.SavedJobRepository;
import com.job_portal.job.repository.UserRepository;

@Service
@Transactional
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final NotificationService notificationService;

    public SavedJobService(
            SavedJobRepository savedJobRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            NotificationService notificationService) {

        this.savedJobRepository = savedJobRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
    }

    // =====================================================
    // SAVE JOB
    // =====================================================

    public SavedJob saveJob(
            String email,
            Long jobId) {

        User user = getUserByEmail(email);

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        Job job =
                jobRepository.findById(jobId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Job not found with ID: "
                                                + jobId
                                )
                        );

        if (savedJobRepository.existsByUserIdAndJobId(
                user.getId(),
                jobId)) {

            throw new IllegalArgumentException(
                    "Job is already saved"
            );
        }

        SavedJob savedJob = new SavedJob();

        savedJob.setUser(user);
        savedJob.setJob(job);

        SavedJob saved =
                savedJobRepository.save(savedJob);

        // Notification should not break the save operation.
        try {

            notificationService.createNotification(
                    user.getId(),
                    "Job \"" +
                            job.getTitle() +
                            "\" has been saved.",
                    "SAVE_JOB"
            );

        } catch (Exception exception) {

            System.err.println(
                    "Failed to create saved-job notification: "
                            + exception.getMessage()
            );
        }

        return saved;
    }

    // =====================================================
    // GET MY SAVED JOBS
    // =====================================================

    @Transactional(readOnly = true)
    public List<SavedJob> getSavedJobs(
            String email) {

        User user = getUserByEmail(email);

        return savedJobRepository.findByUserId(
                user.getId()
        );
    }

    // =====================================================
    // REMOVE SAVED JOB
    // =====================================================

    public boolean removeSavedJob(
            String email,
            Long jobId) {

        User user = getUserByEmail(email);

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        if (!savedJobRepository.existsByUserIdAndJobId(
                user.getId(),
                jobId)) {

            return false;
        }

        savedJobRepository.deleteByUserIdAndJobId(
                user.getId(),
                jobId
        );

        return true;
    }

    // =====================================================
    // CHECK SAVED
    // =====================================================

    @Transactional(readOnly = true)
    public boolean isSaved(
            String email,
            Long jobId) {

        User user = getUserByEmail(email);

        if (jobId == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        return savedJobRepository.existsByUserIdAndJobId(
                user.getId(),
                jobId
        );
    }

    // =====================================================
    // COUNT SAVED JOBS
    // =====================================================

    @Transactional(readOnly = true)
    public long totalSavedJobs(
            String email) {

        User user = getUserByEmail(email);

        return savedJobRepository.countByUserId(
                user.getId()
        );
    }

    // =====================================================
    // FIND USER BY EMAIL
    // =====================================================

    private User getUserByEmail(
            String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Authenticated user email is required"
            );
        }

        String normalizedEmail =
                email.trim()
                        .toLowerCase(Locale.ROOT);

        User user =
                userRepository.findByEmail(
                        normalizedEmail
                );

        if (user == null) {

            throw new IllegalArgumentException(
                    "Authenticated user not found"
            );
        }

        return user;
    }
}