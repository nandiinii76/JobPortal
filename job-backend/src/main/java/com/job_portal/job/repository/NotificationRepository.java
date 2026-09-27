package com.job_portal.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.job_portal.job.model.Notification;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification>
    findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    List<Notification>
    findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
            Long userId
    );

    long countByUserIdAndIsReadFalse(
            Long userId
    );

    void deleteByUserId(
            Long userId
    );
}