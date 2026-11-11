
package com.job_portal.job.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.Notification;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.UserRepository;
import com.job_portal.job.service.NotificationService;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // =====================================================
    // CONSTRUCTOR INJECTION
    // =====================================================

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository) {

        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }


    // =====================================================
    // GET CURRENT USER ID
    // =====================================================

    private Long getCurrentUserId(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return null;
        }

        String email =
                authentication.getName();

        if (email == null ||
                email.trim().isEmpty()) {

            return null;
        }

        User user =
                userRepository.findByEmail(
                        email.trim().toLowerCase()
                );

        if (user == null) {
            return null;
        }

        return user.getId();
    }


    // =====================================================
    // GET ALL NOTIFICATIONS
    // GET /notifications
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getUserNotifications(
            Authentication authentication) {

        Long userId =
                getCurrentUserId(authentication);

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Authenticated user not found."
                    );
        }

        List<Notification> notifications =
                notificationService
                        .getUserNotifications(userId);

        return ResponseEntity.ok(
                notifications
        );
    }


    // =====================================================
    // GET UNREAD NOTIFICATIONS
    // GET /notifications/unread
    // =====================================================

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(
            Authentication authentication) {

        Long userId =
                getCurrentUserId(authentication);

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Authenticated user not found."
                    );
        }

        List<Notification> notifications =
                notificationService
                        .getUnreadNotifications(userId);

        return ResponseEntity.ok(
                notifications
        );
    }


    // =====================================================
    // GET UNREAD COUNT
    // GET /notifications/count
    // =====================================================

    @GetMapping("/count")
    public ResponseEntity<?> getUnreadCount(
            Authentication authentication) {

        Long userId =
                getCurrentUserId(authentication);

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Authenticated user not found."
                    );
        }

        long count =
                notificationService
                        .getUnreadCount(userId);

        return ResponseEntity.ok(
                count
        );
    }


    // =====================================================
    // MARK ONE NOTIFICATION AS READ
    // PUT /notifications/{id}/read
    // =====================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        if (id == null || id <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Valid notification ID is required."
                    );
        }

        Long userId =
                getCurrentUserId(authentication);

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Authenticated user not found."
                    );
        }

        Notification notification =
                notificationService.markAsRead(
                        id,
                        userId
                );

        if (notification == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Notification not found."
                    );
        }

        return ResponseEntity.ok(
                notification
        );
    }


    // =====================================================
    // MARK ALL NOTIFICATIONS AS READ
    // PUT /notifications/read-all
    // =====================================================

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            Authentication authentication) {

        Long userId =
                getCurrentUserId(authentication);

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Authenticated user not found."
                    );
        }

        int count =
                notificationService
                        .markAllAsRead(userId);

        return ResponseEntity.ok(
                count +
                " notifications marked as read."
        );
    }


    // =====================================================
    // DELETE ONE NOTIFICATION
    // DELETE /notifications/{id}
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {

        if (id == null || id <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Valid notification ID is required."
                    );
        }

        Long userId =
                getCurrentUserId(authentication);

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Authenticated user not found."
                    );
        }

        boolean deleted =
                notificationService
                        .deleteNotification(
                                id,
                                userId
                        );

        if (!deleted) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Notification not found."
                    );
        }

        return ResponseEntity.ok(
                "Notification deleted successfully."
        );
    }


    // =====================================================
    // DELETE ALL USER NOTIFICATIONS
    // DELETE /notifications
    // =====================================================

    @DeleteMapping
    public ResponseEntity<?> deleteAllNotifications(
            Authentication authentication) {

        Long userId =
                getCurrentUserId(authentication);

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Authenticated user not found."
                    );
        }

        notificationService
                .deleteAllNotifications(userId);

        return ResponseEntity.ok(
                "All notifications deleted successfully."
        );
    }
}

