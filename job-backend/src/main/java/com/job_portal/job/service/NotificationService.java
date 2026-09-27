package com.job_portal.job.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.job_portal.job.model.Notification;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.NotificationRepository;
import com.job_portal.job.repository.UserRepository;

@Service
@Transactional
public class NotificationService {

@Autowired
private NotificationRepository notificationRepository;

@Autowired
private UserRepository userRepository;


// =====================================================
// CREATE NOTIFICATION
// =====================================================

public Notification createNotification(
        Long userId,
        String message,
        String type) {

    User user = userRepository
            .findById(userId)
            .orElse(null);

    if (user == null) {
        return null;
    }

    if (message == null ||
            message.trim().isEmpty()) {

        return null;
    }

    Notification notification =
            new Notification();

    notification.setUser(user);
    notification.setMessage(message.trim());
    notification.setRead(false);

    /*
     * The current Notification entity does not contain
     * a "type" field.
     *
     * Therefore the type parameter is accepted for
     * compatibility with existing services but is not
     * stored in the database.
     */

    return notificationRepository.save(notification);
}


// =====================================================
// GET ALL NOTIFICATIONS FOR USER
// =====================================================

@Transactional(readOnly = true)
public List<Notification> getUserNotifications(
        Long userId) {

    if (userId == null ||
            !userRepository.existsById(userId)) {

        return List.of();
    }

    return notificationRepository
            .findByUserIdOrderByCreatedAtDesc(userId);
}


// =====================================================
// GET UNREAD NOTIFICATIONS
// =====================================================

@Transactional(readOnly = true)
public List<Notification> getUnreadNotifications(
        Long userId) {

    if (userId == null ||
            !userRepository.existsById(userId)) {

        return List.of();
    }

    return notificationRepository
            .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                    userId
            );
}


// =====================================================
// COUNT UNREAD NOTIFICATIONS
// =====================================================

@Transactional(readOnly = true)
public long getUnreadCount(
        Long userId) {

    if (userId == null ||
            !userRepository.existsById(userId)) {

        return 0;
    }

    return notificationRepository
            .countByUserIdAndIsReadFalse(userId);
}


// =====================================================
// MARK ONE NOTIFICATION AS READ
// =====================================================

public Notification markAsRead(
        Long notificationId) {

    Notification notification =
            notificationRepository
                    .findById(notificationId)
                    .orElse(null);

    if (notification == null) {
        return null;
    }

    notification.setRead(true);

    return notificationRepository.save(
            notification
    );
}


// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// =====================================================

public int markAllAsRead(
        Long userId) {

    if (userId == null ||
            !userRepository.existsById(userId)) {

        return 0;
    }

    List<Notification> notifications =
            notificationRepository
                    .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(
                            userId
                    );

    if (notifications.isEmpty()) {
        return 0;
    }

    for (Notification notification :
            notifications) {

        notification.setRead(true);
    }

    notificationRepository.saveAll(
            notifications
    );

    return notifications.size();
}


// =====================================================
// DELETE ONE NOTIFICATION
// =====================================================

public boolean deleteNotification(
        Long notificationId) {

    if (notificationId == null ||
            !notificationRepository
                    .existsById(notificationId)) {

        return false;
    }

    notificationRepository.deleteById(
            notificationId
    );

    return true;
}


// =====================================================
// DELETE ALL USER NOTIFICATIONS
// =====================================================

public void deleteAllNotifications(
        Long userId) {

    if (userId == null) {
        return;
    }

    notificationRepository
            .deleteByUserId(userId);
}

}
