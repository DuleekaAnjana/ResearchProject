package com.frankmoley.lil.backendresearch.service;

import com.frankmoley.lil.backendresearch.dto.NotificationDTO;
import com.frankmoley.lil.backendresearch.entity.Notification;
import com.frankmoley.lil.backendresearch.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Concrete implementation of the NotificationService interface.
 * Demonstrates OOP Polymorphism: this class implements the service contract defined by the interface.
 * Demonstrates OOP Encapsulation: internal business logic (entity-to-DTO mapping, DB access) is hidden
 * behind the service interface, exposing only clean method signatures to callers.
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Retrieves all notifications for the given user email, ordered by newest first.
     */
    @Override
    public List<NotificationDTO> getNotificationsForUser(String userEmail) {
        List<Notification> notifications = notificationRepository
                .findByUserEmailOrderByCreatedAtDesc(userEmail);
        return notifications.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves only unread notifications for the bell panel preview.
     */
    @Override
    public List<NotificationDTO> getUnreadNotifications(String userEmail) {
        List<Notification> notifications = notificationRepository
                .findByUserEmailAndIsReadOrderByCreatedAtDesc(userEmail, false);
        return notifications.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns the count of unread notifications — used for the badge number on the bell icon.
     */
    @Override
    public long getUnreadCount(String userEmail) {
        return notificationRepository.countByUserEmailAndIsRead(userEmail, false);
    }

    /**
     * Marks a single notification as read by ID.
     */
    @Override
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return toDTO(saved);
    }

    /**
     * Marks ALL notifications for a user as read — used by the "Mark all as read" button.
     */
    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        List<Notification> unread = notificationRepository
                .findByUserEmailAndIsReadOrderByCreatedAtDesc(userEmail, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Create a new notification for a user.
     */
    @Override
    @Transactional
    public void createNotification(String userEmail, String title, String description, String type) {
        Notification notification = Notification.builder()
                .userEmail(userEmail)
                .title(title)
                .description(description)
                .type(type)
                .isRead(false)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    /**
     * Private helper method to convert a Notification entity to a NotificationDTO.
     * This encapsulates the mapping logic inside the service, not exposing it externally.
     */
    private NotificationDTO toDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userEmail(notification.getUserEmail())
                .title(notification.getTitle())
                .description(notification.getDescription())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
