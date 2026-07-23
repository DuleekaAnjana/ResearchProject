package com.frankmoley.lil.backendresearch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Notification.
 * Encapsulates notification data for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Long id;
    private String userEmail;
    private String title;
    private String description;
    private String type;
    private boolean isRead;
    private LocalDateTime createdAt;
}
