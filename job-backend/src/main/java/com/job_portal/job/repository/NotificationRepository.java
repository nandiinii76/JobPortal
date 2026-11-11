
package com.job_portal.job.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.job_portal.job.model.Notification;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // ==========================================
    // GET USER NOTIFICATIONS
    // ==========================================

    List<Notification>
    findByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    // ==========================================
    // GET UNREAD USER NOTIFICATIONS
    // ==========================================

    List<Notification>
    findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
            Long userId
    );

    // ==========================================
    // COUNT UNREAD NOTIFICATIONS
    // ==========================================

    long countByUserIdAndIsReadFalse(
            Long userId
    );

    // ==========================================
    // FIND NOTIFICATION OWNED BY USER
    // ==========================================

    java.util.Optional<Notification>
    findByIdAndUserId(
            Long notificationId,
            Long userId
    );

    // ==========================================
    // CHECK NOTIFICATION OWNERSHIP
    // ==========================================

    boolean existsByIdAndUserId(
            Long notificationId,
            Long userId
    );

    // ==========================================
    // DELETE ALL USER NOTIFICATIONS
    // ==========================================

    void deleteByUserId(
            Long userId
    );
}

