package com.frankmoley.lil.backendresearch.service;

import com.frankmoley.lil.backendresearch.dto.NotificationDTO;

import java.util.List;

/**
 * Abstraction interface for notification business logic.
 * Demonstrates OOP Abstraction: defines a contract that concrete implementations must fulfill.
 */
public interface NotificationService {

    /**
     * Get all notifications for a user email.
     *
     * @param userEmail the user's email
     * @return list of notification DTOs, newest first
     */
    List<NotificationDTO> getNotificationsForUser(String userEmail);

    /**
     * Get only unread notifications for a user (for the bell badge/panel).
     *
     * @param userEmail the user's email
     * @return list of unread notification DTOs
     */
    List<NotificationDTO> getUnreadNotifications(String userEmail);

    /**
     * Get the count of unread notifications for a user.
     *
     * @param userEmail the user's email
     * @return number of unread notifications
     */
    long getUnreadCount(String userEmail);

    /**
     * Mark a single notification as read.
     *
     * @param notificationId the notification ID
     * @return updated notification DTO
     */
    NotificationDTO markAsRead(Long notificationId);

    /**
     * Mark all notifications for a user as read.
     *
     * @param userEmail the user's email
     */
    void markAllAsRead(String userEmail);
}
