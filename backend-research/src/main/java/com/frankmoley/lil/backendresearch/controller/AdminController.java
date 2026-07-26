package com.frankmoley.lil.backendresearch.controller;

import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.entity.Supervisor;
import com.frankmoley.lil.backendresearch.repository.PaperRepository;
import com.frankmoley.lil.backendresearch.repository.SupervisorRepository;
import com.frankmoley.lil.backendresearch.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final PaperRepository paperRepository;
    private final SupervisorRepository supervisorRepository;
    private final NotificationService notificationService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        List<Paper> allPapers = paperRepository.findAll();

        long totalPublications = allPapers.size();
        long approved = allPapers.stream()
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus()))
                .count();

        long totalViews = allPapers.stream()
                .mapToLong(p -> p.getViews() != null ? p.getViews() : 0L)
                .sum();

        long downloads = allPapers.stream()
                .mapToLong(p -> p.getDownloads() != null ? p.getDownloads() : 0L)
                .sum();

        // Get latest 10 submissions (ordered by submittedAt desc)
        List<Paper> latestSubmissions = allPapers.stream()
                .filter(p -> p.getSubmittedAt() != null)
                .sorted((p1, p2) -> p2.getSubmittedAt().compareTo(p1.getSubmittedAt()))
                .limit(10)
                .toList();

        // Populate student names
        for (Paper p : latestSubmissions) {
            if (p.getStudentName() == null || p.getStudentName().isBlank()) {
                p.setStudentName("Registered Student");
            }
        }

        populateFormattedPublicationIds(latestSubmissions);

        Map<String, Object> response = new HashMap<>();
        response.put("totalPublications", totalPublications);
        response.put("approved", approved);
        response.put("totalViews", totalViews);
        response.put("downloads", downloads);
        response.put("latestSubmissions", latestSubmissions);

        return ResponseEntity.ok(response);
    }

    private void populateFormattedPublicationId(Paper paper) {
        if (paper == null || paper.getId() == null) return;
        Long maxId = paperRepository.findMaxPublicationId();
        if (maxId != null && maxId >= 100) {
            paper.setFormattedPublicationId(String.format("PUB-%03d", paper.getId()));
        } else {
            paper.setFormattedPublicationId(String.format("PUB-%02d", paper.getId()));
        }
    }

    private void populateFormattedPublicationIds(List<Paper> papers) {
        if (papers == null || papers.isEmpty()) return;
        Long maxId = paperRepository.findMaxPublicationId();
        boolean useThreeDigits = maxId != null && maxId >= 100;
        for (Paper paper : papers) {
            if (paper.getId() != null) {
                if (useThreeDigits) {
                    paper.setFormattedPublicationId(String.format("PUB-%03d", paper.getId()));
                } else {
                    paper.setFormattedPublicationId(String.format("PUB-%02d", paper.getId()));
                }
            }
        }
    }

    @GetMapping("/supervisors")
    public ResponseEntity<List<Supervisor>> getAllSupervisors() {
        return ResponseEntity.ok(supervisorRepository.findAll());
    }

    @PostMapping("/papers/{id}/check-duplicate")
    public ResponseEntity<?> checkDuplicate(@PathVariable Long id) {
        Optional<Paper> paperOpt = paperRepository.findById(id);
        if (paperOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Paper paper = paperOpt.get();
        paper.setDuplicateCheckedAt(LocalDateTime.now());
        Paper saved = paperRepository.save(paper);

        // Notify student that plagiarism/duplicate check was performed
        notificationService.createNotification(
                paper.getStudentEmail(),
                "Duplicate Check Completed",
                "Your submission '" + paper.getTitle() + "' has successfully completed duplicate check.",
                "SUBMISSION"
        );

        populateFormattedPublicationId(saved);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/papers/{id}/confirm-originality")
    public ResponseEntity<?> confirmOriginality(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Paper> paperOpt = paperRepository.findById(id);
        if (paperOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String decision = request.get("decision");
        if (decision == null || decision.isBlank()) {
            return ResponseEntity.badRequest().body("Decision is required.");
        }

        Paper paper = paperOpt.get();
        paper.setDuplicateCheckedAt(LocalDateTime.now());
        
        if ("DUPLICATE DETECTED".equalsIgnoreCase(decision) || "DUPLICATE_DETECTED".equalsIgnoreCase(decision)) {
            paper.setAdminApprovalStatus("DUPLICATE DETECTED");
            paper.setStatus("REJECTED");
        } else {
            paper.setAdminApprovalStatus("PENDING");
        }

        String supervisorEmail = request.get("supervisorEmail");
        if (supervisorEmail != null && !supervisorEmail.isBlank()) {
            Optional<Supervisor> supervisorOpt = supervisorRepository.findByEmail(supervisorEmail);
            if (supervisorOpt.isPresent() && !"DUPLICATE DETECTED".equalsIgnoreCase(paper.getAdminApprovalStatus())) {
                Supervisor supervisor = supervisorOpt.get();
                paper.setAssignedSupervisorEmail(supervisor.getEmail());
                paper.setSupervisorName(supervisor.getFullName());
                paper.setSupervisorAssignedAt(LocalDateTime.now());
                paper.setStatus("PENDING");

                // Notify student that supervisor has been assigned
                notificationService.createNotification(
                        paper.getStudentEmail(),
                        "Supervisor Assigned",
                        supervisor.getFullName() + " has been assigned as supervisor for your submission '" + paper.getTitle() + "'.",
                        "SUPERVISOR_ASSIGNED"
                );

                // Notify supervisor of the new assigned paper
                notificationService.createNotification(
                        supervisor.getEmail(),
                        "New Research Paper Assigned",
                        "A new research paper '" + paper.getTitle() + "' has been assigned to you for review.",
                        "SUBMISSION"
                );
            }
        }
        
        Paper saved = paperRepository.save(paper);
        
        notificationService.createNotification(
                paper.getStudentEmail(),
                "Originality Verification Complete",
                "Your submission '" + paper.getTitle() + "' has been verified: " + paper.getAdminApprovalStatus() + ".",
                "SUBMISSION"
        );

        populateFormattedPublicationId(saved);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/papers/{id}/assign-supervisor")
    public ResponseEntity<?> assignSupervisor(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Optional<Paper> paperOpt = paperRepository.findById(id);
        if (paperOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String supervisorEmail = request.get("supervisorEmail");
        if (supervisorEmail == null || supervisorEmail.isBlank()) {
            return ResponseEntity.badRequest().body("Supervisor email is required.");
        }

        Paper paper = paperOpt.get();

        if ("No Supervisor Available".equalsIgnoreCase(supervisorEmail)) {
            paper.setAssignedSupervisorEmail("No Supervisor Available");
            paper.setSupervisorName("No Supervisor Available");
            paper.setSupervisorAssignedAt(LocalDateTime.now());
            paper.setUnderReviewAt(LocalDateTime.now());
            paper.setStatus("SUPERVISOR NOT AVAILABLE");
            paper.setAdminApprovalStatus("SUPERVISOR NOT AVAILABLE");
            Paper saved = paperRepository.save(paper);
            populateFormattedPublicationId(saved);
            
            // Notify student that no supervisor is available
            notificationService.createNotification(
                    paper.getStudentEmail(),
                    "Supervisor Assignment Status",
                    "No supervisor is currently available for your submission '" + paper.getTitle() + "'.",
                    "SUBMISSION"
            );
            return ResponseEntity.ok(saved);
        }

        Optional<Supervisor> supervisorOpt = supervisorRepository.findByEmail(supervisorEmail);
        if (supervisorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Supervisor not found.");
        }

        Supervisor supervisor = supervisorOpt.get();

        paper.setAssignedSupervisorEmail(supervisor.getEmail());
        paper.setSupervisorName(supervisor.getFullName());
        paper.setSupervisorAssignedAt(LocalDateTime.now());
        paper.setUnderReviewAt(LocalDateTime.now());
        paper.setStatus("PENDING");
        paper.setAdminApprovalStatus("VERIFIED");
        Paper saved = paperRepository.save(paper);
        populateFormattedPublicationId(saved);

        // Notify student that supervisor has been assigned
        notificationService.createNotification(
                paper.getStudentEmail(),
                "Supervisor Assigned",
                supervisor.getFullName() + " has been assigned as supervisor for your submission '" + paper.getTitle() + "'.",
                "SUPERVISOR_ASSIGNED"
        );

        // Notify supervisor of the new assigned paper
        notificationService.createNotification(
                supervisor.getEmail(),
                "New Research Paper Assigned",
                "A new research paper '" + paper.getTitle() + "' has been assigned to you for review.",
                "SUBMISSION"
        );

        return ResponseEntity.ok(saved);
    }
}
