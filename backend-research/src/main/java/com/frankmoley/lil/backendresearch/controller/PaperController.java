package com.frankmoley.lil.backendresearch.controller;

import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.entity.Student;
import com.frankmoley.lil.backendresearch.entity.Supervisor;
import com.frankmoley.lil.backendresearch.repository.PaperRepository;
import com.frankmoley.lil.backendresearch.repository.StudentRepository;
import com.frankmoley.lil.backendresearch.repository.SupervisorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Controller to handle all Student paper submissions.
 * Keeps basic Spring Boot updates in a simple, readable manner.
 */
@RestController
@RequestMapping("/api/papers")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PaperController {

    private final PaperRepository paperRepository;
    private final StudentRepository studentRepository;
    private final SupervisorRepository supervisorRepository;
    private final com.frankmoley.lil.backendresearch.service.NotificationService notificationService;

    /**
     * POST /api/papers
     * Creates or updates a paper submission.
     * Maps the logged-in student to the paper as a foreign key.
     */
    @PostMapping
    public ResponseEntity<?> saveOrSubmitPaper(@RequestBody Paper paperRequest) {
        if (paperRequest.getTitle() == null || paperRequest.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Title is required.");
        }
        if (paperRequest.getAbstractText() == null || paperRequest.getAbstractText().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Abstract is required.");
        }

        // Find the student by email to establish the relationship
        Optional<Student> studentOpt = studentRepository.findByEmail(paperRequest.getStudentEmail());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid student email. Student must be registered.");
        }
        Student student = studentOpt.get();

        Paper paper = new Paper();
        // If updating an existing draft
        if (paperRequest.getId() != null) {
            Optional<Paper> existing = paperRepository.findById(paperRequest.getId());
            if (existing.isPresent()) {
                paper = existing.get();
            }
        }

        paper.setTitle(paperRequest.getTitle());
        paper.setAbstractText(paperRequest.getAbstractText());
        paper.setResearchGap(paperRequest.getResearchGap());
        paper.setKeywords(paperRequest.getKeywords());
        paper.setSubcategory(paperRequest.getSubcategory());
        // Inherit category from registered student
        paper.setCategory(student.getResearchCategory());
        paper.setStudentName(student.getFullName());
        paper.setStudentEmail(student.getEmail());
        paper.setSupervisorEmail(paperRequest.getSupervisorEmail());
        paper.setComments(paperRequest.getComments());
        paper.setPdfFileName(paperRequest.getPdfFileName() != null ? paperRequest.getPdfFileName() : "manuscript.pdf");
        paper.setPages(paperRequest.getPages());
        if (paperRequest.getViews() != null) {
            paper.setViews(paperRequest.getViews());
        } else if (paper.getViews() == null) {
            paper.setViews(0);
        }
        if (paperRequest.getDownloads() != null) {
            paper.setDownloads(paperRequest.getDownloads());
        } else if (paper.getDownloads() == null) {
            paper.setDownloads(0);
        }
        
        // Status can be DRAFT, PENDING, APPROVED, REJECTED
        String requestStatus = paperRequest.getStatus();
        boolean isPending = "SUBMITTED".equalsIgnoreCase(requestStatus) || "PENDING".equalsIgnoreCase(requestStatus);
        if (isPending) {
            paper.setStatus("PENDING");
            paper.setSubmittedAt(LocalDateTime.now());
        } else {
            paper.setStatus("DRAFT");
        }

        paper.setStudent(student);

        Paper savedPaper = paperRepository.save(paper);

        if (isPending) {
            notificationService.createNotification(
                student.getEmail(),
                "Submission received",
                "Your paper '" + savedPaper.getTitle() + "' is under administrator validation.",
                "SUBMISSION"
            );
        }

        return ResponseEntity.ok(savedPaper);
    }

    /**
     * GET /api/papers/student
     * Retrieves all papers (drafts, pending, approved, rejected) for a specific student.
     */
    @GetMapping("/student")
    public ResponseEntity<List<Paper>> getPapersByStudent(@RequestParam String email) {
        // Simple fetch all and filter by student email to keep it basic
        List<Paper> allPapers = paperRepository.findAll();
        List<Paper> studentPapers = allPapers.stream()
                .filter(p -> p.getStudentEmail() != null && p.getStudentEmail().equalsIgnoreCase(email))
                .toList();
        return ResponseEntity.ok(studentPapers);
    }

    /**
     * GET /api/papers/supervisor
     * Retrieves all papers assigned to a specific supervisor.
     */
    @GetMapping("/supervisor")
    public ResponseEntity<List<Paper>> getPapersBySupervisor(@RequestParam String email) {
        List<Paper> papers = paperRepository.findBySupervisorEmailOrderBySubmittedAtDesc(email);
        String name = supervisorRepository.findByEmail(email)
                .map(Supervisor::getFullName)
                .orElse("Prof. Ranjith Silva");
        for (Paper p : papers) {
            p.setSupervisorName(name);
        }
        return ResponseEntity.ok(papers);
    }

    /**
     * GET /api/papers/{id}
     * Retrieves a single paper by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Paper> getPaperById(@PathVariable Long id) {
        Optional<Paper> paperOpt = paperRepository.findById(id);
        if (paperOpt.isPresent()) {
            Paper paper = paperOpt.get();
            String name = supervisorRepository.findByEmail(paper.getSupervisorEmail())
                    .map(Supervisor::getFullName)
                    .orElse("Prof. Ranjith Silva");
            paper.setSupervisorName(name);
            return ResponseEntity.ok(paper);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * POST /api/papers/{id}/review
     * Supervisor submits decision (APPROVED or REJECTED) with satisfaction level and comments.
     */
    @PostMapping("/{id}/review")
    public ResponseEntity<?> reviewPaper(@PathVariable Long id, @RequestBody Paper reviewData) {
        Optional<Paper> paperOpt = paperRepository.findById(id);
        if (paperOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Paper paper = paperOpt.get();

        String newStatus = reviewData.getStatus();
        if (newStatus == null || (!newStatus.equalsIgnoreCase("APPROVED") && !newStatus.equalsIgnoreCase("REJECTED"))) {
            return ResponseEntity.badRequest().body("Invalid review status. Must be APPROVED or REJECTED.");
        }

        if ("REJECTED".equalsIgnoreCase(newStatus)) {
            boolean hasReason = (reviewData.getResearchDirection() != null && !reviewData.getResearchDirection().trim().isEmpty())
                    || (reviewData.getResearchGapFeedback() != null && !reviewData.getResearchGapFeedback().trim().isEmpty())
                    || (reviewData.getMissingFindings() != null && !reviewData.getMissingFindings().trim().isEmpty())
                    || (reviewData.getComments() != null && !reviewData.getComments().trim().isEmpty());
            if (!hasReason) {
                return ResponseEntity.badRequest().body("Require at least one reason to Reject Reaseach");
            }
        } else if ("APPROVED".equalsIgnoreCase(newStatus)) {
            Integer satLevel = reviewData.getSatisfactionLevel();
            if (satLevel == null || satLevel < 2) {
                return ResponseEntity.badRequest().body("You need atleast Satisfaction level: 2 / 5 to Approval");
            }
        }

        paper.setStatus(newStatus.toUpperCase());
        String name = supervisorRepository.findByEmail(paper.getSupervisorEmail())
                .map(Supervisor::getFullName)
                .orElse("Prof. Ranjith Silva");
        paper.setSupervisorName(name);
        paper.setResearchDirection(reviewData.getResearchDirection());
        paper.setResearchGapFeedback(reviewData.getResearchGapFeedback());
        paper.setMissingFindings(reviewData.getMissingFindings());
        paper.setComments(reviewData.getComments());
        paper.setSatisfactionLevel(reviewData.getSatisfactionLevel());
        paper.setReviewedAt(LocalDateTime.now());
        if (paper.getUnderReviewAt() == null) {
            paper.setUnderReviewAt(LocalDateTime.now().minusDays(1));
        }

        Paper saved = paperRepository.save(paper);

        // Notify the student
        notificationService.createNotification(
            paper.getStudentEmail(),
            "Paper review complete",
            "Your paper '" + paper.getTitle() + "' has been " + paper.getStatus().toLowerCase() + " by supervisor.",
            "FEEDBACK"
        );

        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/papers/{id}
     * Deletes a paper submission.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePaper(@PathVariable Long id) {
        Optional<Paper> paperOpt = paperRepository.findById(id);
        if (paperOpt.isPresent()) {
            paperRepository.delete(paperOpt.get());
            return ResponseEntity.ok().body("{\"message\": \"Paper deleted successfully.\"}");
        }
        return ResponseEntity.notFound().build();
    }
}
