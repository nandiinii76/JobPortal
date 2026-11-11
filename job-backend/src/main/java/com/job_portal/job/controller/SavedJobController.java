package com.job_portal.job.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.SavedJob;
import com.job_portal.job.service.SavedJobService;

@RestController
@RequestMapping("/saved-jobs")
public class SavedJobController {

    private final SavedJobService savedJobService;

    public SavedJobController(SavedJobService savedJobService) {
        this.savedJobService = savedJobService;
    }

    // =====================================================
    // SAVE JOB
    // =====================================================

    @PostMapping
    public ResponseEntity<SavedJob> saveJob(
            @RequestParam Long jobId,
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return ResponseEntity.status(401).build();
        }

        SavedJob savedJob =
                savedJobService.saveJob(
                        authentication.getName(),
                        jobId
                );

        if (savedJob == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(savedJob);
    }

    // =====================================================
    // GET MY SAVED JOBS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<SavedJob>> getSavedJobs(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                savedJobService.getSavedJobs(
                        authentication.getName()
                )
        );
    }

    // =====================================================
    // REMOVE SAVED JOB
    // =====================================================

    @DeleteMapping
    public ResponseEntity<String> removeSavedJob(
            @RequestParam Long jobId,
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return ResponseEntity.status(401).build();
        }

        boolean removed =
                savedJobService.removeSavedJob(
                        authentication.getName(),
                        jobId
                );

        if (!removed) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                "Saved job removed successfully."
        );
    }

    // =====================================================
    // CHECK WHETHER JOB IS SAVED
    // =====================================================

    @GetMapping("/check")
    public ResponseEntity<Boolean> isSaved(
            @RequestParam Long jobId,
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                savedJobService.isSaved(
                        authentication.getName(),
                        jobId
                )
        );
    }

    // =====================================================
    // SAVED JOB COUNT
    // =====================================================

    @GetMapping("/count")
    public ResponseEntity<Long> totalSavedJobs(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                savedJobService.totalSavedJobs(
                        authentication.getName()
                )
        );
    }
}