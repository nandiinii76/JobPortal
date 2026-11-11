package com.job_portal.job.specifications;

import com.job_portal.job.model.Job;
import org.springframework.data.jpa.domain.Specification;

public final class JobSpecification {

    private JobSpecification() {
        // Utility class
    }

    // =====================================================
    // TITLE
    // =====================================================

    public static Specification<Job> titleContains(String title) {

        return (root, query, criteriaBuilder) -> {

            if (title == null || title.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(
                            root.get("title")
                    ),
                    "%" + title.trim().toLowerCase() + "%"
            );
        };
    }

    // =====================================================
    // LOCATION
    // =====================================================

    public static Specification<Job> locationContains(
            String location) {

        return (root, query, criteriaBuilder) -> {

            if (location == null || location.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(
                            root.get("location")
                    ),
                    "%" + location.trim().toLowerCase() + "%"
            );
        };
    }

    // =====================================================
    // CATEGORY
    // =====================================================

    public static Specification<Job> categoryContains(
            String category) {

        return (root, query, criteriaBuilder) -> {

            if (category == null || category.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(
                            root.get("category")
                    ),
                    "%" + category.trim().toLowerCase() + "%"
            );
        };
    }

    // =====================================================
    // JOB TYPE
    // =====================================================

    public static Specification<Job> jobTypeContains(
            String jobType) {

        return (root, query, criteriaBuilder) -> {

            if (jobType == null || jobType.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(
                            root.get("jobType")
                    ),
                    "%" + jobType.trim().toLowerCase() + "%"
            );
        };
    }

    // =====================================================
    // EXPERIENCE LEVEL
    // =====================================================

    public static Specification<Job> experienceLevelContains(
            String experienceLevel) {

        return (root, query, criteriaBuilder) -> {

            if (experienceLevel == null ||
                    experienceLevel.trim().isEmpty()) {

                return null;
            }

            return criteriaBuilder.like(
                    criteriaBuilder.lower(
                            root.get("experienceLevel")
                    ),
                    "%" + experienceLevel
                            .trim()
                            .toLowerCase() + "%"
            );
        };
    }

    // =====================================================
    // MINIMUM SALARY
    // =====================================================

    public static Specification<Job> salaryGreaterThanOrEqual(
            Double minSalary) {

        return (root, query, criteriaBuilder) -> {

            if (minSalary == null) {
                return null;
            }

            return criteriaBuilder.greaterThanOrEqualTo(
                    root.get("salary"),
                    minSalary
            );
        };
    }

    // =====================================================
    // MAXIMUM SALARY
    // =====================================================

    public static Specification<Job> salaryLessThanOrEqual(
            Double maxSalary) {

        return (root, query, criteriaBuilder) -> {

            if (maxSalary == null) {
                return null;
            }

            return criteriaBuilder.lessThanOrEqualTo(
                    root.get("salary"),
                    maxSalary
            );
        };
    }

    // =====================================================
    // EMPLOYER ID
    // =====================================================

    public static Specification<Job> employerIdEquals(
            Long employerId) {

        return (root, query, criteriaBuilder) -> {

            if (employerId == null) {
                return null;
            }

            return criteriaBuilder.equal(
                    root.get("employer").get("id"),
                    employerId
            );
        };
    }
}