package com.frankmoley.lil.backendresearch.controller;

import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.entity.Student;
import com.frankmoley.lil.backendresearch.repository.PaperRepository;
import com.frankmoley.lil.backendresearch.repository.StudentRepository;
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
        
        // Status can be DRAFT, PENDING, APPROVED, REJECTED
        String requestStatus = paperRequest.getStatus();
        if ("SUBMITTED".equalsIgnoreCase(requestStatus) || "PENDING".equalsIgnoreCase(requestStatus)) {
            paper.setStatus("PENDING");
            paper.setSubmittedAt(LocalDateTime.now());
        } else {
            paper.setStatus("DRAFT");
        }

        paper.setStudent(student);

        Paper savedPaper = paperRepository.save(paper);
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
}
