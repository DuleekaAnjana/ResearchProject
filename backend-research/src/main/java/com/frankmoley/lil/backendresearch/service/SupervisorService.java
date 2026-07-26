package com.frankmoley.lil.backendresearch.service;

import com.frankmoley.lil.backendresearch.dto.PaperDTO;
import com.frankmoley.lil.backendresearch.dto.SupervisorDashboardDTO;
import com.frankmoley.lil.backendresearch.entity.Supervisor;
import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.repository.PaperRepository;
import com.frankmoley.lil.backendresearch.repository.SupervisorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SupervisorService {

    private final PaperRepository paperRepository;
    private final SupervisorRepository supervisorRepository;

    public SupervisorDashboardDTO getDashboardData(String supervisorEmail) {
        String email = (supervisorEmail != null && !supervisorEmail.isBlank()) 
                ? supervisorEmail 
                : "demo@researchsphere.edu";

        Optional<Supervisor> supervisorOptional = supervisorRepository.findByEmail(email);
        String name = supervisorOptional.map(Supervisor::getFullName).orElse("Prof. R. Silva");
        String university = supervisorOptional.map(Supervisor::getUniversity).orElse("University of Colombo");

        List<Paper> papers = paperRepository.findByAssignedSupervisorEmail(email);
        if (papers.isEmpty()) {
            papers = paperRepository.findByStuRequestedSupervisorEmailOrderBySubmittedAtDesc(email);
        }

        long assignedCount = papers.size();
        long pendingCount = papers.stream().filter(p -> "PENDING".equalsIgnoreCase(p.getStatus()) || "UNDER REVIEW".equalsIgnoreCase(p.getStatus())).count();
        long approvedCount = papers.stream().filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus())).count();
        long rejectedCount = papers.stream().filter(p -> "REJECTED".equalsIgnoreCase(p.getStatus())).count();

        // Calculate average review time (mocked constant since reviewTimeDays is removed)
        double avgDays = assignedCount > 0 ? 2.4 : 0.0;

        java.time.LocalDateTime twentyFourHoursAgo = java.time.LocalDateTime.now().minusHours(24);
        List<PaperDTO> recentReviews = papers.stream()
                .map(p -> PaperDTO.builder()
                        .id(p.getId())
                        .title(p.getTitle())
                        .student(p.getStudentName())
                        .studentEmail(p.getStudentEmail())
                        .status(p.getStatus())
                        .category(p.getCategory())
                        .reviewTimeDays(2.4)
                        .formattedPublicationId(p.getFormattedPublicationId())
                        .submittedAt(p.getSubmittedAt())
                        .build())
                .toList();

        // Weekly workload map: Mon: 3, Tue: 5, Wed: 2, Thu: 6, Fri: 4, Sat: 1, Sun: 0
        Map<String, Integer> workload = new LinkedHashMap<>();
        workload.put("Mon", assignedCount > 0 ? 3 : 0);
        workload.put("Tue", assignedCount > 0 ? 5 : 0);
        workload.put("Wed", assignedCount > 0 ? 2 : 0);
        workload.put("Thu", assignedCount > 0 ? 6 : 0);
        workload.put("Fri", assignedCount > 0 ? 4 : 0);
        workload.put("Sat", assignedCount > 0 ? 1 : 0);
        workload.put("Sun", 0);

        return SupervisorDashboardDTO.builder()
                .supervisorName(name)
                .supervisorEmail(email)
                .university(university)
                .assignedPapers(assignedCount)
                .pendingReviews(pendingCount)
                .approved(approvedCount)
                .rejected(rejectedCount)
                .avgReviewTime(String.format(Locale.US, "%.1f days", avgDays))
                .recentReviews(recentReviews)
                .weeklyWorkload(workload)
                .build();
    }
}
