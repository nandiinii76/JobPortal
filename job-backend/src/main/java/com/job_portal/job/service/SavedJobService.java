
package com.job_portal.job.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.job.model.Job;
import com.job_portal.job.model.SavedJob;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.SavedJobRepository;
import com.job_portal.job.repository.UserRepository;

@Service
public class SavedJobService {

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private NotificationService notificationService;

    // ==========================
    // Save Job
    // ==========================
    public SavedJob saveJob(Long userId, Long jobId) {

        User user = userRepository.findById(userId).orElse(null);
        Job job = jobRepository.findById(jobId).orElse(null);

        if (user == null || job == null) {
            return null;
        }

        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            return null;
        }

        SavedJob savedJob = new SavedJob();
        savedJob.setUser(user);
        savedJob.setJob(job);

        SavedJob saved = savedJobRepository.save(savedJob);

        notificationService.createNotification(
                userId,
                "Job \"" + job.getTitle() + "\" has been saved.",
                "SAVE_JOB"
        );

        return saved;
    }

    // ==========================
    // User Saved Jobs
    // ==========================
    public List<SavedJob> getSavedJobs(Long userId) {
        return savedJobRepository.findByUserId(userId);
    }

    // ==========================
    // Remove Saved Job
    // ==========================
    public boolean removeSavedJob(Long userId, Long jobId) {

        if (!savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            return false;
        }

        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);

        return true;
    }

    // ==========================
    // Check Saved
    // ==========================
    public boolean isSaved(Long userId, Long jobId) {
        return savedJobRepository.existsByUserIdAndJobId(userId, jobId);
    }

    // ==========================
    // Count Saved Jobs
    // ==========================
    public long totalSavedJobs(Long userId) {
        return savedJobRepository.countByUserId(userId);
    }
}

