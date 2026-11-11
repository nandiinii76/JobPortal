package com.job_portal.job.controller;

import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.dto.CreateJobRequest;
import com.job_portal.job.dto.JobDto;
import com.job_portal.job.model.Job;
import com.job_portal.job.service.JobService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/jobs")
@Validated
public class JobController {

    private final JobService jobService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    // =====================================================
    // GET ALL JOBS - PAGINATED
    // GET /jobs?page=0&size=10&sort=title,asc
    // =====================================================

    @GetMapping
    public ResponseEntity<Page<JobDto>> getAllJobs(

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "id,desc")
            String sort) {

        Pageable pageable =
                createPageable(page, size, sort);

        Page<JobDto> jobs =
                jobService
                        .getAllJobs(pageable)
                        .map(JobDto::from);

        return ResponseEntity.ok(jobs);
    }

    // =====================================================
    // GET JOB BY ID
    // GET /jobs/{id}
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(
            @PathVariable Long id) {

        Job job =
                jobService.getJobById(id);

        return ResponseEntity.ok(
                JobDto.from(job)
        );
    }

    // =====================================================
    // CREATE JOB
    // POST /jobs
    // =====================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<JobDto> createJob(
            @Valid @RequestBody CreateJobRequest request,
            Authentication authentication) {

        String email =
                getAuthenticatedEmail(authentication);

        Job savedJob =
                jobService.createJob(
                        request,
                        email
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(JobDto.from(savedJob));
    }

    // =====================================================
    // GET JOBS BY EMPLOYER
    // GET /jobs/employer/{employerId}
    // =====================================================

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<Page<JobDto>> getJobsByEmployer(

            @PathVariable Long employerId,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "id,desc")
            String sort) {

        Pageable pageable =
                createPageable(page, size, sort);

        Page<JobDto> jobs =
                jobService
                        .getJobsByEmployer(
                                employerId,
                                pageable
                        )
                        .map(JobDto::from);

        return ResponseEntity.ok(jobs);
    }

    // =====================================================
    // UPDATE JOB
    // PUT /jobs/{id}
    // =====================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<JobDto> updateJob(

            @PathVariable Long id,

            @Valid @RequestBody CreateJobRequest request,

            Authentication authentication) {

        String email =
                getAuthenticatedEmail(authentication);

        Job updatedJob =
                jobService.updateJob(
                        id,
                        request,
                        email
                );

        return ResponseEntity.ok(
                JobDto.from(updatedJob)
        );
    }

    // =====================================================
    // DELETE JOB
    // DELETE /jobs/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYER', 'RECRUITER')")
    public ResponseEntity<String> deleteJob(

            @PathVariable Long id,

            Authentication authentication) {

        String email =
                getAuthenticatedEmail(authentication);

        jobService.deleteJob(
                id,
                email
        );

        return ResponseEntity.ok(
                "Job deleted successfully"
        );
    }

    // =====================================================
    // JOB COUNT
    // GET /jobs/count
    // =====================================================

    @GetMapping("/count")
    public ResponseEntity<Long> getJobCount() {

        return ResponseEntity.ok(
                jobService.getJobCount()
        );
    }

    // =====================================================
    // ADVANCED JOB SEARCH
    // GET /jobs/search
    // =====================================================

    @GetMapping("/search")
    public ResponseEntity<Page<JobDto>> searchJobs(

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
            Double maxSalary,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "10")
            int size,

            @RequestParam(defaultValue = "id,desc")
            String sort) {

        Pageable pageable =
                createPageable(page, size, sort);

        Page<JobDto> jobs =
                jobService.searchJobs(
                        title,
                        location,
                        category,
                        jobType,
                        experienceLevel,
                        minSalary,
                        maxSalary,
                        pageable
                )
                .map(JobDto::from);

        return ResponseEntity.ok(jobs);
    }

    // =====================================================
    // CREATE PAGEABLE
    // =====================================================

    private Pageable createPageable(
            int page,
            int size,
            String sort) {

        // -------------------------------------------------
        // PAGE VALIDATION
        // -------------------------------------------------

        if (page < 0) {

            throw new IllegalArgumentException(
                    "Page number cannot be negative"
            );
        }

        // -------------------------------------------------
        // SIZE VALIDATION
        // -------------------------------------------------

        if (size < 1) {

            throw new IllegalArgumentException(
                    "Page size must be greater than 0"
            );
        }

        if (size > 100) {

            throw new IllegalArgumentException(
                    "Page size cannot exceed 100"
            );
        }

        // -------------------------------------------------
        // DEFAULT SORT
        // -------------------------------------------------

        if (sort == null ||
                sort.trim().isEmpty()) {

            return PageRequest.of(
                    page,
                    size,
                    Sort.by(
                            Sort.Direction.DESC,
                            "id"
                    )
            );
        }

        // -------------------------------------------------
        // PARSE SORT
        // Example:
        // title,asc
        // salary,desc
        // -------------------------------------------------

        String[] sortParts =
                sort.split(",");

        String property =
                sortParts[0]
                        .trim();

        if (property.isEmpty()) {

            property = "id";
        }

        Sort.Direction direction =
                Sort.Direction.DESC;

        if (sortParts.length > 1) {

            String directionValue =
                    sortParts[1]
                            .trim()
                            .toLowerCase(Locale.ROOT);

            if (directionValue.equals("asc")) {

                direction =
                        Sort.Direction.ASC;

            } else if (directionValue.equals("desc")) {

                direction =
                        Sort.Direction.DESC;

            } else {

                throw new IllegalArgumentException(
                        "Sort direction must be 'asc' or 'desc'"
                );
            }
        }

        // -------------------------------------------------
        // ALLOWED SORT FIELDS
        // -------------------------------------------------

        if (!isAllowedSortField(property)) {

            throw new IllegalArgumentException(
                    "Invalid sort field: " + property
            );
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(
                        direction,
                        property
                )
        );
    }

    // =====================================================
    // ALLOWED SORT FIELDS
    // =====================================================

    private boolean isAllowedSortField(
            String property) {

        return property.equals("id")
                || property.equals("title")
                || property.equals("company")
                || property.equals("location")
                || property.equals("salary")
                || property.equals("category")
                || property.equals("jobType")
                || property.equals("experienceLevel");
    }

    // =====================================================
    // GET AUTHENTICATED EMAIL
    // =====================================================

    private String getAuthenticatedEmail(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Authentication is required"
            );
        }

        return authentication
                .getName()
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}