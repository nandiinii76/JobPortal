package com.job_portal.job.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.Job;
import com.job_portal.job.service.JobService;

@RestController
@RequestMapping("/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    // ==========================================
    // GET ALL JOBS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {

        return ResponseEntity.ok(
                jobService.getAllJobs()
        );
    }

    // ==========================================
    // GET JOB BY ID
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(
            @PathVariable Long id) {

        Job job = jobService.getJobById(id);

        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(job);
    }

    // ==========================================
    // CREATE JOB
    // ==========================================

    @PostMapping
    public ResponseEntity<Job> createJob(
            @RequestBody Job job,
            @RequestParam Long employerId) {

        Job savedJob =
                jobService.createJob(
                        job,
                        employerId
                );

        if (savedJob == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(savedJob);
    }

    // ==========================================
    // GET JOBS BY EMPLOYER
    // ==========================================

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<Job>> getJobsByEmployer(
            @PathVariable Long employerId) {

        return ResponseEntity.ok(
                jobService.getJobsByEmployer(employerId)
        );
    }

    // ==========================================
    // UPDATE JOB
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<Job> updateJob(
            @PathVariable Long id,
            @RequestBody Job updatedJob) {

        Job job = jobService.updateJob(
                id,
                updatedJob
        );

        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(job);
    }

    // ==========================================
    // DELETE JOB
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteJob(
            @PathVariable Long id) {

        boolean deleted =
                jobService.deleteJob(id);

        if (!deleted) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                "Job deleted successfully"
        );
    }

    // ==========================================
    // JOB COUNT
    // ==========================================

    @GetMapping("/count")
    public ResponseEntity<Long> getJobCount() {

        return ResponseEntity.ok(
                jobService.getJobCount()
        );
    }
    // ==========================================
// SEARCH JOBS
// ==========================================

@GetMapping("/search")
public ResponseEntity<List<Job>> searchJobs(

        @RequestParam(required = false)
        String title,

        @RequestParam(required = false)
        String location,

        @RequestParam(required = false)
        String category,

        @RequestParam(required = false)
        String jobType,

        @RequestParam(required = false)
        String experienceLevel,

        @RequestParam(required = false)
        Double minSalary,

        @RequestParam(required = false)
        Double maxSalary) {

    List<Job> jobs = jobService.searchJobs(
            title,
            location,
            category,
            jobType,
            experienceLevel,
            minSalary,
            maxSalary
    );

    return ResponseEntity.ok(jobs);
}
}