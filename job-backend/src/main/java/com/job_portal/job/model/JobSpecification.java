package com.job_portal.job.specifications;

import org.springframework.data.jpa.domain.Specification;

import com.job_portal.job.model.Job;

public class JobSpecification {

    // =====================================================
    // SEARCH BY KEYWORD
    // Searches title, company, description and location
    // =====================================================

    public static Specification<Job> hasKeyword(String keyword) {

        return (root, query, criteriaBuilder) -> {

            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }

            String search = "%" + keyword.trim().toLowerCase() + "%";

            return criteriaBuilder.or(

                criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")),
                    search
                ),

                criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("company")),
                    search
                ),

                criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")),
                    search
                ),

                criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("location")),
                    search
                )
            );
        };
    }


    // =====================================================
    // SEARCH BY LOCATION
    // =====================================================

    public static Specification<Job> hasLocation(String location) {

        return (root, query, criteriaBuilder) -> {

            if (location == null || location.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("location")),
                "%" + location.trim().toLowerCase() + "%"
            );
        };
    }


    // =====================================================
    // SEARCH BY CATEGORY
    // =====================================================

    public static Specification<Job> hasCategory(String category) {

        return (root, query, criteriaBuilder) -> {

            if (category == null || category.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("category")),
                category.trim().toLowerCase()
            );
        };
    }


    // =====================================================
    // SEARCH BY JOB TYPE
    // =====================================================

    public static Specification<Job> hasJobType(String jobType) {

        return (root, query, criteriaBuilder) -> {

            if (jobType == null || jobType.trim().isEmpty()) {
                return null;
            }

            return criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("jobType")),
                jobType.trim().toLowerCase()
            );
        };
    }


    // =====================================================
    // SEARCH BY EXPERIENCE LEVEL
    // =====================================================

    public static Specification<Job> hasExperienceLevel(
            String experienceLevel) {

        return (root, query, criteriaBuilder) -> {

            if (experienceLevel == null ||
                experienceLevel.trim().isEmpty()) {

                return null;
            }

            return criteriaBuilder.equal(
                criteriaBuilder.lower(
                    root.get("experienceLevel")
                ),
                experienceLevel.trim().toLowerCase()
            );
        };
    }


    // =====================================================
    // MINIMUM SALARY
    // =====================================================

    public static Specification<Job> hasMinimumSalary(
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

    public static Specification<Job> hasMaximumSalary(
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
}