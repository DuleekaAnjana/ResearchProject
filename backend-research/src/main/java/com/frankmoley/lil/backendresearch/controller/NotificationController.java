package com.frankmoley.lil.backendresearch.controller;

import com.frankmoley.lil.backendresearch.dto.NotificationDTO;
import com.frankmoley.lil.backendresearch.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller exposing notification endpoints.
 * Uses the NotificationService interface (OOP Abstraction/Dependency Injection).
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications?email=...
     * Returns all notifications for the given user email.
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(@RequestParam String email) {
        List<NotificationDTO> notifications = notificationService.getNotificationsForUser(email);
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /api/notifications/unread?email=...
     * Returns only unread notifications (for the bell panel dropdown).
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@RequestParam String email) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /api/notifications/unread-count?email=...
     * Returns the count of unread notifications (for the bell badge number).
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam String email) {
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * PUT /api/notifications/{id}/read
     * Marks a single notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        NotificationDTO updated = notificationService.markAsRead(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/notifications/read-all?email=...
     * Marks all notifications for a user as read.
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestParam String email) {
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read."));
    }
}
