package com.frankmoley.lil.backendresearch.controller;

import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.entity.Student;
import com.frankmoley.lil.backendresearch.entity.Supervisor;
import com.frankmoley.lil.backendresearch.repository.PaperRepository;
import com.frankmoley.lil.backendresearch.repository.StudentRepository;
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
    private final StudentRepository studentRepository;
    private final SupervisorRepository supervisorRepository;
    private final NotificationService notificationService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData() {
        List<Paper> allPapers = paperRepository.findAll();

        long totalSubmissions = allPapers.size();
        long underAdminApproval = allPapers.stream()
                .filter(p -> p.getAdminApprovalStatus() == null || 
                        "PENDING".equalsIgnoreCase(p.getAdminApprovalStatus()) || 
                        "UNDER ADMIN APPROVAL".equalsIgnoreCase(p.getAdminApprovalStatus()) || 
                        "UNDER_ADMIN_APPROVAL".equalsIgnoreCase(p.getAdminApprovalStatus()))
                .count();

        long verified = allPapers.stream()
                .filter(p -> p.getAdminApprovalStatus() != null && 
                        ("VERIFIED".equalsIgnoreCase(p.getAdminApprovalStatus()) || 
                         "APPROVED".equalsIgnoreCase(p.getAdminApprovalStatus())))
                .count();

        long duplicateDetected = allPapers.stream()
                .filter(p -> p.getAdminApprovalStatus() != null && 
                        ("DUPLICATE DETECTED".equalsIgnoreCase(p.getAdminApprovalStatus()) || 
                         "DUPLICATE_DETECTED".equalsIgnoreCase(p.getAdminApprovalStatus())))
                .count();

        long supervisorUnavailable = allPapers.stream()
                .filter(p -> p.getAdminApprovalStatus() != null && 
                        ("SUPERVISOR UNAVAILABLE".equalsIgnoreCase(p.getAdminApprovalStatus()) || 
                         "SUPERVISOR_UNAVAILABLE".equalsIgnoreCase(p.getAdminApprovalStatus()) || 
                         "SUPERVISOR NOT AVAILABLE".equalsIgnoreCase(p.getAdminApprovalStatus()) || 
                         "SUPERVISOR_NOT_AVAILABLE".equalsIgnoreCase(p.getAdminApprovalStatus())))
                .count();

        // Get latest 10 submissions (ordered by submittedAt desc)
        List<Paper> latestSubmissions = allPapers.stream()
                .filter(p -> p.getSubmittedAt() != null)
                .sorted((p1, p2) -> p2.getSubmittedAt().compareTo(p1.getSubmittedAt()))
                .limit(10)
                .toList();

        // Populate student names from student table
        for (Paper p : latestSubmissions) {
            populateStudentNameFromTable(p);
        }

        populateFormattedPublicationIds(latestSubmissions);

        Map<String, Object> response = new HashMap<>();
        response.put("totalSubmissions", totalSubmissions);
        response.put("underAdminApproval", underAdminApproval);
        response.put("verified", verified);
        response.put("duplicateDetected", duplicateDetected);
        response.put("supervisorUnavailable", supervisorUnavailable);
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
            paper.setStatus("SUPERVISOR UNAVAILABLE");
            paper.setAdminApprovalStatus("SUPERVISOR UNAVAILABLE");
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

    @GetMapping("/papers")
    public ResponseEntity<List<Paper>> getAllPapers(@RequestParam(required = false) String status) {
        List<Paper> allPapers = paperRepository.findAll();
        populateFormattedPublicationIds(allPapers);
        for (Paper p : allPapers) {
            populateStudentNameFromTable(p);
        }
        
        if (status == null || status.isBlank()) {
            return ResponseEntity.ok(allPapers);
        }
        
        List<Paper> filtered = allPapers.stream()
                .filter(p -> {
                    String appStatus = p.getAdminApprovalStatus();
                    if ("UNDER_ADMIN_APPROVAL".equalsIgnoreCase(status) || "UNDER ADMIN APPROVAL".equalsIgnoreCase(status) || "PENDING".equalsIgnoreCase(status)) {
                        return appStatus == null || 
                               "PENDING".equalsIgnoreCase(appStatus) || 
                               "UNDER ADMIN APPROVAL".equalsIgnoreCase(appStatus) || 
                               "UNDER_ADMIN_APPROVAL".equalsIgnoreCase(appStatus);
                    } else if ("VERIFIED".equalsIgnoreCase(status)) {
                        return "VERIFIED".equalsIgnoreCase(appStatus) || "APPROVED".equalsIgnoreCase(appStatus);
                    } else if ("DUPLICATE_DETECTED".equalsIgnoreCase(status) || "DUPLICATE DETECTED".equalsIgnoreCase(status)) {
                        return "DUPLICATE DETECTED".equalsIgnoreCase(appStatus) || "DUPLICATE_DETECTED".equalsIgnoreCase(appStatus);
                    } else if ("SUPERVISOR_UNAVAILABLE".equalsIgnoreCase(status) || "SUPERVISOR UNAVAILABLE".equalsIgnoreCase(status)) {
                        return "SUPERVISOR UNAVAILABLE".equalsIgnoreCase(appStatus) || 
                               "SUPERVISOR_UNAVAILABLE".equalsIgnoreCase(appStatus) || 
                               "SUPERVISOR NOT AVAILABLE".equalsIgnoreCase(appStatus) || 
                               "SUPERVISOR_NOT_AVAILABLE".equalsIgnoreCase(appStatus);
                    }
                    return status.equalsIgnoreCase(appStatus);
                })
                .toList();
        return ResponseEntity.ok(filtered);
    }

    private void populateStudentNameFromTable(Paper paper) {
        if (paper.getStudentEmail() != null && !paper.getStudentEmail().isBlank()) {
            studentRepository.findByEmail(paper.getStudentEmail())
                    .ifPresent(student -> paper.setStudentName(student.getFullName()));
        }
        if (paper.getStudentName() == null || paper.getStudentName().isBlank()) {
            paper.setStudentName("Registered Student");
        }
    }
}
