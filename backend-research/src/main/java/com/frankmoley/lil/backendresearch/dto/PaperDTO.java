package com.frankmoley.lil.backendresearch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperDTO {
    private Long id;
    private String title;
    private String student;
    private String studentEmail;
    private String status;
    private String category;
    private Double reviewTimeDays;
    private String formattedPublicationId;
    private java.time.LocalDateTime submittedAt;
}
