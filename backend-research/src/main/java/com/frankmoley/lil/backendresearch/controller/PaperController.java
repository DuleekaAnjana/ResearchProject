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
import java.util.Base64;
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
        paper.setStuRequestedSupervisorEmail(paperRequest.getSupervisorEmail());
        paper.setAssignedSupervisorEmail(null); // Do NOT auto-assign upon submission, admin must review and assign
        paper.setComments(paperRequest.getComments());
        if (paperRequest.getPdfBase64() != null && !paperRequest.getPdfBase64().isBlank()) {
            try {
                String base64Data = paperRequest.getPdfBase64();
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }
                byte[] decoded = Base64.getDecoder().decode(base64Data);
                paper.setPdfData(decoded);
            } catch (Exception e) {
                // ignore
            }
        }
        paper.setUploadedManuscript(paperRequest.getPdfFileName() != null ? paperRequest.getPdfFileName() : "manuscript.pdf");
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
            paper.setAdminApprovalStatus("PENDING");
            paper.setSubmittedAt(LocalDateTime.now());
        } else {
            paper.setStatus("DRAFT");
            paper.setAdminApprovalStatus("DRAFT");
        }

        Paper savedPaper = paperRepository.save(paper);

        if (isPending) {
            notificationService.createNotification(
                student.getEmail(),
                "Submission received",
                "Your paper '" + savedPaper.getTitle() + "' is under administrator validation.",
                "SUBMISSION"
            );
            notificationService.createNotification(
                "repoadmin@researchsphere.edu",
                "New paper submission",
                "A new paper '" + savedPaper.getTitle() + "' has been submitted by " + student.getFullName() + ".",
                "SUBMISSION"
            );
        }

        populateFormattedPublicationId(savedPaper);
        return ResponseEntity.ok(savedPaper);
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

    private void populateStudentName(Paper paper) {
        if (paper.getStudentEmail() != null) {
            studentRepository.findByEmail(paper.getStudentEmail())
                    .ifPresent(student -> {
                        paper.setStudentName(student.getFullName());
                        paper.setStudentUniversity(student.getUniversity());
                    });
        }
        if (paper.getStudentName() == null) {
            paper.setStudentName("Registered Student");
        }
        if (paper.getStudentUniversity() == null) {
            paper.setStudentUniversity("University of Colombo");
        }
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
                .peek(this::populateStudentName)
                .toList();
        populateFormattedPublicationIds(studentPapers);
        return ResponseEntity.ok(studentPapers);
    }

    /**
     * GET /api/papers/supervisor
     * Retrieves all papers assigned to a specific supervisor.
     */
    @GetMapping("/supervisor")
    public ResponseEntity<List<Paper>> getPapersBySupervisor(@RequestParam String email) {
        List<Paper> papers = paperRepository.findByAssignedSupervisorEmailOrderBySubmittedAtDesc(email);
        if (papers.isEmpty()) {
            papers = paperRepository.findByStuRequestedSupervisorEmailOrderBySubmittedAtDesc(email);
        }
        String name = supervisorRepository.findByEmail(email)
                .map(Supervisor::getFullName)
                .orElse("Prof. Ranjith Silva");
        for (Paper p : papers) {
            p.setSupervisorName(name);
            populateStudentName(p);
        }
        populateFormattedPublicationIds(papers);
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
            populateStudentName(paper);
            populateFormattedPublicationId(paper);
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
        paper.setSupervisorDesignedAt(LocalDateTime.now());
        if (paper.getUnderReviewAt() == null) {
            paper.setUnderReviewAt(LocalDateTime.now().minusDays(1));
        }

        Paper saved = paperRepository.save(paper);

        // Notify the student
        if ("APPROVED".equalsIgnoreCase(paper.getStatus())) {
            notificationService.createNotification(
                paper.getStudentEmail(),
                "Research Approved",
                "Your research paper '" + paper.getTitle() + "' has been approved by your supervisor. You are now permitted to publish it.",
                "FEEDBACK"
            );
        } else if ("REJECTED".equalsIgnoreCase(paper.getStatus())) {
            notificationService.createNotification(
                paper.getStudentEmail(),
                "Research Rejected",
                "Your research paper '" + paper.getTitle() + "' was not approved by your supervisor. We encourage you to address the feedback and make a new submission.",
                "FEEDBACK"
            );
        }

        populateStudentName(saved);
        populateFormattedPublicationId(saved);
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

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getPaperPdf(@PathVariable Long id) {
        Optional<Paper> paperOpt = paperRepository.findById(id);
        if (paperOpt.isPresent()) {
            Paper paper = paperOpt.get();
            byte[] pdf = paper.getPdfData();
            if (pdf == null) {
                pdf = createDummyPdf(paper.getTitle());
            }
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "inline; filename=\"" + paper.getPdfFileName() + "\"")
                    .body(pdf);
        }
        return ResponseEntity.notFound().build();
    }

    private byte[] createDummyPdf(String title) {
        String pdfContent = "%PDF-1.4\n" +
                "1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj\n" +
                "2 0 obj <</Type/Pages/Kids[3 0 R]/Count 1>> endobj\n" +
                "3 0 obj <</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>> endobj\n" +
                "4 0 obj <</Length 60>> stream\n" +
                "BT\n" +
                "/F1 24 Tf\n" +
                "100 700 Td\n" +
                "(" + title + ") Tj\n" +
                "ET\n" +
                "endstream\n" +
                "endobj\n" +
                "xref\n" +
                "0 5\n" +
                "0000000000 65535 f\n" +
                "0000000009 00000 n\n" +
                "0000000052 00000 n\n" +
                "0000000101 00000 n\n" +
                "0000000224 00000 n\n" +
                "trailer <</Size 5/Root 1 0 R>>\n" +
                "startxref\n" +
                "335\n" +
                "%%EOF";
        return pdfContent.getBytes(java.nio.charset.StandardCharsets.ISO_8859_1);
    }
}
