package com.job_portal.job.service;

import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.job_portal.job.dto.CreateJobRequest;
import com.job_portal.job.model.Job;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.UserRepository;
import com.job_portal.job.specifications.JobSpecification;

@Service
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // GET ALL JOBS
    // =====================================================

    @Transactional(readOnly = true)
    public List<Job> getAllJobs() {

        return jobRepository.findAll();
    }

    // =====================================================
    // GET JOBS - PAGINATED
    // =====================================================

    @Transactional(readOnly = true)
    public Page<Job> getAllJobs(Pageable pageable) {

        if (pageable == null) {
            throw new IllegalArgumentException(
                    "Page information is required"
            );
        }

        return jobRepository.findAll(pageable);
    }

    // =====================================================
    // GET JOB BY ID
    // =====================================================

    @Transactional(readOnly = true)
    public Job getJobById(Long id) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Job not found with ID: " + id
                        )
                );
    }

    // =====================================================
    // CREATE JOB
    // =====================================================

    public Job createJob(
            CreateJobRequest request,
            String employerEmail) {

        validateJobRequest(request);

        User employer =
                findUserByEmail(employerEmail);

        if (employer == null) {
            throw new IllegalArgumentException(
                    "Employer account not found"
            );
        }

        validateEmployerRole(employer);

        Job job = new Job();

        job.setTitle(
                request.getTitle().trim()
        );

        job.setCompany(
                request.getCompany().trim()
        );

        job.setLocation(
                request.getLocation().trim()
        );

        job.setDescription(
                request.getDescription().trim()
        );

        job.setSalary(
                request.getSalary()
        );

        job.setCategory(
                cleanOptionalValue(
                        request.getCategory()
                )
        );

        job.setJobType(
                cleanOptionalValue(
                        request.getJobType()
                )
        );

        job.setExperienceLevel(
                cleanOptionalValue(
                        request.getExperienceLevel()
                )
        );

        job.setEmployer(employer);

        return jobRepository.save(job);
    }

    // =====================================================
    // GET JOBS BY EMPLOYER
    // =====================================================

    @Transactional(readOnly = true)
    public List<Job> getJobsByEmployer(
            Long employerId) {

        if (employerId == null) {
            throw new IllegalArgumentException(
                    "Employer ID is required"
            );
        }

        return jobRepository.findByEmployerId(
                employerId
        );
    }

    // =====================================================
    // GET PAGINATED JOBS BY EMPLOYER
    // =====================================================

    @Transactional(readOnly = true)
    public Page<Job> getJobsByEmployer(
            Long employerId,
            Pageable pageable) {

        if (employerId == null) {
            throw new IllegalArgumentException(
                    "Employer ID is required"
            );
        }

        if (pageable == null) {
            throw new IllegalArgumentException(
                    "Page information is required"
            );
        }

        return jobRepository.findAll(
                JobSpecification.employerIdEquals(employerId),
                pageable
        );
    }

    // =====================================================
    // GET JOB OWNER ID
    // =====================================================

    @Transactional(readOnly = true)
    public Long getJobOwnerId(Long jobId) {

        if (jobId == null) {
            return null;
        }

        Job job =
                jobRepository.findById(jobId)
                        .orElse(null);

        if (job == null ||
                job.getEmployer() == null) {

            return null;
        }

        return job.getEmployer().getId();
    }

    // =====================================================
    // CHECK JOB OWNERSHIP
    // =====================================================

    @Transactional(readOnly = true)
    public boolean isJobOwnedBy(
            Long jobId,
            String employerEmail) {

        if (jobId == null ||
                employerEmail == null ||
                employerEmail.trim().isEmpty()) {

            return false;
        }

        User employer =
                findUserByEmail(employerEmail);

        if (employer == null ||
                employer.getId() == null) {

            return false;
        }

        Long jobOwnerId =
                getJobOwnerId(jobId);

        return jobOwnerId != null &&
                jobOwnerId.equals(
                        employer.getId()
                );
    }

    // =====================================================
    // UPDATE JOB
    // =====================================================

    public Job updateJob(
            Long id,
            CreateJobRequest request,
            String employerEmail) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        validateJobRequest(request);

        Job job =
                jobRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Job not found with ID: " + id
                                )
                        );

        User employer =
                findUserByEmail(employerEmail);

        if (employer == null) {
            throw new IllegalArgumentException(
                    "Employer account not found"
            );
        }

        validateEmployerRole(employer);

        if (!isOwnedByUser(job, employer)) {
            throw new IllegalArgumentException(
                    "You are not authorized to modify this job"
            );
        }

        updateJobFields(
                job,
                request
        );

        return jobRepository.save(job);
    }

    // =====================================================
    // DELETE JOB
    // =====================================================

    public boolean deleteJob(
            Long id,
            String employerEmail) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Job ID is required"
            );
        }

        Job job =
                jobRepository.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Job not found with ID: " + id
                                )
                        );

        User employer =
                findUserByEmail(employerEmail);

        if (employer == null) {
            throw new IllegalArgumentException(
                    "Employer account not found"
            );
        }

        validateEmployerRole(employer);

        if (!isOwnedByUser(job, employer)) {
            throw new IllegalArgumentException(
                    "You are not authorized to delete this job"
            );
        }

        jobRepository.delete(job);

        return true;
    }

    // =====================================================
    // TOTAL JOB COUNT
    // =====================================================

    @Transactional(readOnly = true)
    public long getJobCount() {

        return jobRepository.count();
    }

    // =====================================================
    // ADVANCED JOB SEARCH
    // =====================================================

    @Transactional(readOnly = true)
    public Page<Job> searchJobs(
            String title,
            String location,
            String category,
            String jobType,
            String experienceLevel,
            Double minSalary,
            Double maxSalary,
            Pageable pageable) {

        if (pageable == null) {
            throw new IllegalArgumentException(
                    "Page information is required"
            );
        }

        validateSalaryRange(
                minSalary,
                maxSalary
        );

        /*
         * Build the search dynamically using
         * JobSpecification.
         */
        Specification<Job> specification =
                Specification.where(null);

        // =================================================
        // TITLE
        // =================================================

        specification = specification.and(
                JobSpecification.titleContains(title)
        );

        // =================================================
        // LOCATION
        // =================================================

        specification = specification.and(
                JobSpecification.locationContains(location)
        );

        // =================================================
        // CATEGORY
        // =================================================

        specification = specification.and(
                JobSpecification.categoryContains(category)
        );

        // =================================================
        // JOB TYPE
        // =================================================

        specification = specification.and(
                JobSpecification.jobTypeContains(jobType)
        );

        // =================================================
        // EXPERIENCE LEVEL
        // =================================================

        specification = specification.and(
                JobSpecification.experienceLevelContains(
                        experienceLevel
                )
        );

        // =================================================
        // MINIMUM SALARY
        // =================================================

        specification = specification.and(
                JobSpecification.salaryGreaterThanOrEqual(
                        minSalary
                )
        );

        // =================================================
        // MAXIMUM SALARY
        // =================================================

        specification = specification.and(
                JobSpecification.salaryLessThanOrEqual(
                        maxSalary
                )
        );

        return jobRepository.findAll(
                specification,
                pageable
        );
    }

    // =====================================================
    // FIND USER BY EMAIL
    // =====================================================

    private User findUserByEmail(String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Authenticated employer is required"
            );
        }

        String normalizedEmail =
                email.trim()
                        .toLowerCase(Locale.ROOT);

        return userRepository.findByEmail(
                normalizedEmail
        );
    }

    // =====================================================
    // VALIDATE EMPLOYER ROLE
    // =====================================================

    private void validateEmployerRole(User user) {

        String role =
                user.getRole();

        if (role == null) {

            throw new IllegalArgumentException(
                    "Only employers or recruiters can manage jobs"
            );
        }

        String normalizedRole =
                role.trim()
                        .toUpperCase(Locale.ROOT);

        if (!normalizedRole.equals("ROLE_EMPLOYER")
                && !normalizedRole.equals("EMPLOYER")
                && !normalizedRole.equals("ROLE_RECRUITER")
                && !normalizedRole.equals("RECRUITER")) {

            throw new IllegalArgumentException(
                    "Only employers or recruiters can manage jobs"
            );
        }
    }

    // =====================================================
    // CHECK JOB OWNERSHIP
    // =====================================================

    private boolean isOwnedByUser(
            Job job,
            User user) {

        return job != null
                && job.getEmployer() != null
                && job.getEmployer().getId() != null
                && user != null
                && user.getId() != null
                && job.getEmployer()
                        .getId()
                        .equals(user.getId());
    }

    // =====================================================
    // UPDATE JOB FIELDS
    // =====================================================

    private void updateJobFields(
            Job job,
            CreateJobRequest request) {

        job.setTitle(
                request.getTitle().trim()
        );

        job.setCompany(
                request.getCompany().trim()
        );

        job.setLocation(
                request.getLocation().trim()
        );

        job.setDescription(
                request.getDescription().trim()
        );

        job.setSalary(
                request.getSalary()
        );

        job.setCategory(
                cleanOptionalValue(
                        request.getCategory()
                )
        );

        job.setJobType(
                cleanOptionalValue(
                        request.getJobType()
                )
        );

        job.setExperienceLevel(
                cleanOptionalValue(
                        request.getExperienceLevel()
                )
        );
    }

    // =====================================================
    // VALIDATE JOB REQUEST
    // =====================================================

    private void validateJobRequest(
            CreateJobRequest request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Job details are required"
            );
        }

        if (!hasText(request.getTitle())) {

            throw new IllegalArgumentException(
                    "Job title is required"
            );
        }

        if (!hasText(request.getCompany())) {

            throw new IllegalArgumentException(
                    "Company name is required"
            );
        }

        if (!hasText(request.getLocation())) {

            throw new IllegalArgumentException(
                    "Location is required"
            );
        }

        if (!hasText(request.getDescription())) {

            throw new IllegalArgumentException(
                    "Job description is required"
            );
        }

        if (request.getSalary() == null) {

            throw new IllegalArgumentException(
                    "Salary is required"
            );
        }

        if (request.getSalary() < 0) {

            throw new IllegalArgumentException(
                    "Salary cannot be negative"
            );
        }
    }

    // =====================================================
    // VALIDATE SALARY RANGE
    // =====================================================

    private void validateSalaryRange(
            Double minSalary,
            Double maxSalary) {

        if (minSalary != null &&
                minSalary < 0) {

            throw new IllegalArgumentException(
                    "Minimum salary cannot be negative"
            );
        }

        if (maxSalary != null &&
                maxSalary < 0) {

            throw new IllegalArgumentException(
                    "Maximum salary cannot be negative"
            );
        }

        if (minSalary != null &&
                maxSalary != null &&
                minSalary > maxSalary) {

            throw new IllegalArgumentException(
                    "Minimum salary cannot be greater than maximum salary"
            );
        }
    }

    // =====================================================
    // OPTIONAL VALUE CLEANUP
    // =====================================================

    private String cleanOptionalValue(
            String value) {

        if (!hasText(value)) {
            return null;
        }

        return value.trim();
    }

    // =====================================================
    // TEXT CHECK
    // =====================================================

    private boolean hasText(String value) {

        return value != null &&
                !value.trim().isEmpty();
    }
}