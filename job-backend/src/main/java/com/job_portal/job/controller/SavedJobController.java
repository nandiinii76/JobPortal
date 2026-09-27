
package com.job_portal.job.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.SavedJob;
import com.job_portal.job.service.SavedJobService;

@RestController
@RequestMapping("/saved-jobs")
@CrossOrigin(origins = "*")
public class SavedJobController {

    @Autowired
    private SavedJobService savedJobService;

    // ==========================
    // Save Job
    // ==========================
    @PostMapping
    public ResponseEntity<SavedJob> saveJob(
            @RequestParam Long userId,
            @RequestParam Long jobId) {

        SavedJob savedJob = savedJobService.saveJob(userId, jobId);

        if (savedJob == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(savedJob);
    }

    // ==========================
    // User Saved Jobs
    // ==========================
    @GetMapping("/{userId}")
    public ResponseEntity<List<SavedJob>> getSavedJobs(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                savedJobService.getSavedJobs(userId));
    }

    // ==========================
    // Remove Saved Job
    // ==========================
    @DeleteMapping
    public ResponseEntity<String> removeSavedJob(
            @RequestParam Long userId,
            @RequestParam Long jobId) {

        boolean removed = savedJobService.removeSavedJob(userId, jobId);

        if (!removed) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("Saved job removed successfully.");
    }

    // ==========================
    // Check Saved
    // ==========================
    @GetMapping("/check")
    public ResponseEntity<Boolean> isSaved(
            @RequestParam Long userId,
            @RequestParam Long jobId) {

        return ResponseEntity.ok(
                savedJobService.isSaved(userId, jobId));
    }

    // ==========================
    // Saved Jobs Count
    // ==========================
    @GetMapping("/count/{userId}")
    public ResponseEntity<Long> totalSavedJobs(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                savedJobService.totalSavedJobs(userId));
    }
}

