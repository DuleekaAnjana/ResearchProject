package com.frankmoley.lil.backendresearch.service;

import com.frankmoley.lil.backendresearch.dto.PaperDTO;
import com.frankmoley.lil.backendresearch.dto.SupervisorDashboardDTO;
import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.entity.User;
import com.frankmoley.lil.backendresearch.repository.PaperRepository;
import com.frankmoley.lil.backendresearch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SupervisorService {

    private final PaperRepository paperRepository;
    private final UserRepository userRepository;

    public SupervisorDashboardDTO getDashboardData(String supervisorEmail) {
        String email = (supervisorEmail != null && !supervisorEmail.isBlank()) 
                ? supervisorEmail 
                : "demo@researchsphere.edu";

        Optional<User> userOptional = userRepository.findByEmail(email);
        String name = userOptional.map(User::getFullName).orElse("Prof. R. Silva");
        String university = userOptional.map(User::getUniversity).orElse("University of Colombo");

        List<Paper> papers = paperRepository.findBySupervisorEmail(email);
        if (papers.isEmpty()) {
            // Fallback to default demo email papers if email didn't match any custom supervisor
            papers = paperRepository.findBySupervisorEmail("demo@researchsphere.edu");
        }

        long assignedCount = papers.size();
        long pendingCount = papers.stream().filter(p -> "PENDING".equalsIgnoreCase(p.getStatus())).count();
        long approvedCount = papers.stream().filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus())).count();
        long rejectedCount = papers.stream().filter(p -> "REJECTED".equalsIgnoreCase(p.getStatus())).count();

        // Calculate average review time
        double avgDays = papers.stream()
                .filter(p -> p.getReviewTimeDays() != null)
                .mapToDouble(Paper::getReviewTimeDays)
                .average()
                .orElse(2.4);

        List<PaperDTO> recentReviews = papers.stream()
                .map(p -> PaperDTO.builder()
                        .id(p.getId())
                        .title(p.getTitle())
                        .student(p.getStudentName())
                        .studentEmail(p.getStudentEmail())
                        .status(p.getStatus())
                        .category(p.getCategory())
                        .reviewTimeDays(p.getReviewTimeDays())
                        .build())
                .toList();

        // Weekly workload map: Mon: 3, Tue: 5, Wed: 2, Thu: 6, Fri: 4, Sat: 1, Sun: 0
        Map<String, Integer> workload = new LinkedHashMap<>();
        workload.put("Mon", 3);
        workload.put("Tue", 5);
        workload.put("Wed", 2);
        workload.put("Thu", 6);
        workload.put("Fri", 4);
        workload.put("Sat", 1);
        workload.put("Sun", 0);

        return SupervisorDashboardDTO.builder()
                .supervisorName(name)
                .supervisorEmail(email)
                .university(university)
                .assignedPapers(assignedCount > 0 ? assignedCount : 8)
                .pendingReviews(pendingCount > 0 ? pendingCount : 1)
                .approved(approvedCount > 0 ? approvedCount : 6)
                .rejected(rejectedCount > 0 ? rejectedCount : 1)
                .avgReviewTime(String.format(Locale.US, "%.1f days", avgDays))
                .recentReviews(recentReviews)
                .weeklyWorkload(workload)
                .build();
    }
}
