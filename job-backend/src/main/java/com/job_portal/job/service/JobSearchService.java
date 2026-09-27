package com.job_portal.job.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.job_portal.job.model.Job;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.specifications.JobSpecification;

@Service
public class JobSearchService {

    @Autowired
    private JobRepository jobRepository;

    public List<Job> searchJobs(
            String title,
            String location,
            String category,
            String jobType,
            String experienceLevel,
            Double minSalary,
            Double maxSalary) {

        Specification<Job> specification =
                Specification.where(null);

        // TITLE / KEYWORD
        if (title != null && !title.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasKeyword(title)
            );
        }

        // LOCATION
        if (location != null && !location.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasLocation(location)
            );
        }

        // CATEGORY
        if (category != null && !category.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasCategory(category)
            );
        }

        // JOB TYPE
        if (jobType != null && !jobType.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasJobType(jobType)
            );
        }

        // EXPERIENCE LEVEL
        if (experienceLevel != null && !experienceLevel.isBlank()) {
            specification = specification.and(
                    JobSpecification.hasExperienceLevel(experienceLevel)
            );
        }

        // MINIMUM SALARY
        if (minSalary != null) {
            specification = specification.and(
                    JobSpecification.hasMinimumSalary(minSalary)
            );
        }

        // MAXIMUM SALARY
        if (maxSalary != null) {
            specification = specification.and(
                    JobSpecification.hasMaximumSalary(maxSalary)
            );
        }

        return jobRepository.findAll(specification);
    }
}