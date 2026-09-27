package com.job_portal.job.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.job.model.Job;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.UserRepository;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    // ==========================================
    // GET ALL JOBS
    // ==========================================

    public List<Job> getAllJobs() {

        return jobRepository.findAll();
    }

    // ==========================================
    // GET JOB BY ID
    // ==========================================

    public Job getJobById(Long id) {

        return jobRepository
                .findById(id)
                .orElse(null);
    }

    // ==========================================
    // CREATE JOB
    // ==========================================

    public Job createJob(
            Job job,
            Long employerId) {

        User employer = userRepository
                .findById(employerId)
                .orElse(null);

        if (employer == null) {
            return null;
        }

        job.setEmployer(employer);

        // Use employer name as company name
        // if company is not provided
        if (job.getCompany() == null
                || job.getCompany().isBlank()) {

            job.setCompany(employer.getName());
        }

        return jobRepository.save(job);
    }

    // ==========================================
    // GET JOBS BY EMPLOYER
    // ==========================================

    public List<Job> getJobsByEmployer(
            Long employerId) {

        return jobRepository
                .findByEmployerId(employerId);
    }

    // ==========================================
    // UPDATE JOB
    // ==========================================

    public Job updateJob(
            Long id,
            Job updatedJob) {

        Job job = jobRepository
                .findById(id)
                .orElse(null);

        if (job == null) {
            return null;
        }

        job.setTitle(updatedJob.getTitle());
        job.setCompany(updatedJob.getCompany());
        job.setLocation(updatedJob.getLocation());
        job.setDescription(updatedJob.getDescription());
        job.setSalary(updatedJob.getSalary());
        job.setCategory(updatedJob.getCategory());
        job.setJobType(updatedJob.getJobType());
        job.setExperienceLevel(
                updatedJob.getExperienceLevel()
        );

        return jobRepository.save(job);
    }

    // ==========================================
    // DELETE JOB
    // ==========================================

    public boolean deleteJob(Long id) {

        if (!jobRepository.existsById(id)) {
            return false;
        }

        jobRepository.deleteById(id);

        return true;
    }

    // ==========================================
    // TOTAL JOB COUNT
    // ==========================================

    public long getJobCount() {

        return jobRepository.count();
    }

    // ==========================================
    // SEARCH JOBS
    // ==========================================

    public List<Job> searchJobs(
            String title,
            String location,
            String category,
            String jobType,
            String experienceLevel,
            Double minSalary,
            Double maxSalary) {

        return jobRepository.findAll()
                .stream()

                // TITLE
                .filter(job ->
                        title == null
                                || title.isBlank()
                                || (job.getTitle() != null
                                && job.getTitle()
                                .toLowerCase()
                                .contains(title.toLowerCase()))
                )

                // LOCATION
                .filter(job ->
                        location == null
                                || location.isBlank()
                                || (job.getLocation() != null
                                && job.getLocation()
                                .toLowerCase()
                                .contains(location.toLowerCase()))
                )

                // CATEGORY
                .filter(job ->
                        category == null
                                || category.isBlank()
                                || (job.getCategory() != null
                                && job.getCategory()
                                .toLowerCase()
                                .contains(category.toLowerCase()))
                )

                // JOB TYPE
                .filter(job ->
                        jobType == null
                                || jobType.isBlank()
                                || (job.getJobType() != null
                                && job.getJobType()
                                .toLowerCase()
                                .contains(jobType.toLowerCase()))
                )

                // EXPERIENCE LEVEL
                .filter(job ->
                        experienceLevel == null
                                || experienceLevel.isBlank()
                                || (job.getExperienceLevel() != null
                                && job.getExperienceLevel()
                                .toLowerCase()
                                .contains(
                                        experienceLevel.toLowerCase()
                                ))
                )

                // MINIMUM SALARY
                .filter(job ->
                        minSalary == null
                                || (job.getSalary() != null
                                && job.getSalary() >= minSalary)
                )

                // MAXIMUM SALARY
                .filter(job ->
                        maxSalary == null
                                || (job.getSalary() != null
                                && job.getSalary() <= maxSalary)
                )

                .toList();
    }
}