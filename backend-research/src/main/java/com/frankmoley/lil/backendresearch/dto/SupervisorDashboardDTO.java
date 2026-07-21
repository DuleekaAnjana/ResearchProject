package com.frankmoley.lil.backendresearch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupervisorDashboardDTO {
    private String supervisorName;
    private String supervisorEmail;
    private String university;
    private long assignedPapers;
    private long pendingReviews;
    private long approved;
    private long rejected;
    private String avgReviewTime;
    private List<PaperDTO> recentReviews;
    private Map<String, Integer> weeklyWorkload;
}
