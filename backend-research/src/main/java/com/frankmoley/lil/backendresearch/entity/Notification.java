package com.frankmoley.lil.backendresearch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Notification entity representing a single notification for a user.
 * Demonstrates OOP Encapsulation: fields are private with controlled access via getters/setters (Lombok @Data).
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Email of the user this notification belongs to.
     * Used to look up notifications per user without foreign key joins.
     */
    @Column(nullable = false)
    private String userEmail;

    /** Short title for the notification, e.g. "Submission received" */
    @Column(nullable = false)
    private String title;

    /** Detailed description/body of the notification */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Type/category of notification, e.g. "SUBMISSION", "SUPERVISOR_ASSIGNED",
     * "PAPER_APPROVED", "FEEDBACK", etc.
     */
    private String type;

    /** Whether the user has read this notification */
    @Column(nullable = false)
    private boolean isRead;

    /** Timestamp when the notification was created */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
