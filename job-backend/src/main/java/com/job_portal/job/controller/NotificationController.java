package com.job_portal.job.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.Notification;
import com.job_portal.job.service.NotificationService;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

private final NotificationService notificationService;

// =====================================================
// CONSTRUCTOR INJECTION
// =====================================================

public NotificationController(
        NotificationService notificationService) {

    this.notificationService = notificationService;
}

// =====================================================
// GET ALL NOTIFICATIONS FOR USER
// GET /notifications/user/{userId}
// =====================================================

@GetMapping("/user/{userId}")
public ResponseEntity<?> getUserNotifications(
        @PathVariable Long userId) {

    if (userId == null || userId <= 0) {

        return ResponseEntity
                .badRequest()
                .body("Valid user ID is required.");
    }

    List<Notification> notifications =
            notificationService.getUserNotifications(userId);

    return ResponseEntity.ok(notifications);
}

// =====================================================
// GET UNREAD NOTIFICATIONS
// GET /notifications/user/{userId}/unread
// =====================================================

@GetMapping("/user/{userId}/unread")
public ResponseEntity<?> getUnreadNotifications(
        @PathVariable Long userId) {

    if (userId == null || userId <= 0) {

        return ResponseEntity
                .badRequest()
                .body("Valid user ID is required.");
    }

    List<Notification> notifications =
            notificationService.getUnreadNotifications(userId);

    return ResponseEntity.ok(notifications);
}

// =====================================================
// GET UNREAD COUNT
// GET /notifications/user/{userId}/count
//
// Used by Navbar.jsx
// =====================================================

@GetMapping("/user/{userId}/count")
public ResponseEntity<?> getUnreadCount(
        @PathVariable Long userId) {

    if (userId == null || userId <= 0) {

        return ResponseEntity
                .badRequest()
                .body("Valid user ID is required.");
    }

    long count =
            notificationService.getUnreadCount(userId);

    return ResponseEntity.ok(count);
}

// =====================================================
// MARK ONE NOTIFICATION AS READ
// PUT /notifications/{id}/read
// =====================================================

@PutMapping("/{id}/read")
public ResponseEntity<?> markAsRead(
        @PathVariable Long id) {

    if (id == null || id <= 0) {

        return ResponseEntity
                .badRequest()
                .body("Valid notification ID is required.");
    }

    Notification notification =
            notificationService.markAsRead(id);

    if (notification == null) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Notification not found.");
    }

    return ResponseEntity.ok(notification);
}

// =====================================================
// MARK ALL NOTIFICATIONS AS READ
// PUT /notifications/user/{userId}/read-all
// =====================================================

@PutMapping("/user/{userId}/read-all")
public ResponseEntity<?> markAllAsRead(
        @PathVariable Long userId) {

    if (userId == null || userId <= 0) {

        return ResponseEntity
                .badRequest()
                .body("Valid user ID is required.");
    }

    int count =
            notificationService.markAllAsRead(userId);

    return ResponseEntity.ok(
            count + " notifications marked as read."
    );
}

// =====================================================
// DELETE ONE NOTIFICATION
// DELETE /notifications/{id}
// =====================================================

@DeleteMapping("/{id}")
public ResponseEntity<?> deleteNotification(
        @PathVariable Long id) {

    if (id == null || id <= 0) {

        return ResponseEntity
                .badRequest()
                .body("Valid notification ID is required.");
    }

    boolean deleted =
            notificationService.deleteNotification(id);

    if (!deleted) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Notification not found.");
    }

    return ResponseEntity.ok(
            "Notification deleted successfully."
    );
}

// =====================================================
// DELETE ALL USER NOTIFICATIONS
// DELETE /notifications/user/{userId}
// =====================================================

@DeleteMapping("/user/{userId}")
public ResponseEntity<?> deleteAllNotifications(
        @PathVariable Long userId) {

    if (userId == null || userId <= 0) {

        return ResponseEntity
                .badRequest()
                .body("Valid user ID is required.");
    }

    notificationService.deleteAllNotifications(userId);

    return ResponseEntity.ok(
            "All notifications deleted successfully."
    );
}

}
