package com.frankmoley.lil.backendresearch.repository;

import com.frankmoley.lil.backendresearch.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Notification entity.
 * Extends JpaRepository to provide standard CRUD operations.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Fetch all notifications for a user, newest first */
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    /** Fetch notifications filtered by read status, newest first */
    List<Notification> findByUserEmailAndIsReadOrderByCreatedAtDesc(String userEmail, boolean isRead);

    /** Count unread notifications for a user */
    long countByUserEmailAndIsRead(String userEmail, boolean isRead);
}
