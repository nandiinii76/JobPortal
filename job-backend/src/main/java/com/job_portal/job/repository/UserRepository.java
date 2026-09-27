package com.job_portal.job.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.job_portal.job.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}
