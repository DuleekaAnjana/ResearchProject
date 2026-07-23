package com.frankmoley.lil.backendresearch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Paper Entity representing a submission.
 * Relates to the Student entity via a @ManyToOne relationship (foreign key).
 * Keeps independent auto-increment numbering for the primary key.
 */
@Entity
@Table(name = "papers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Title of the publication */
    @Column(nullable = false)
    private String title;

    /** Abstract of the publication */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String abstractText;

    /** Research Gap (Optional, expanded) */
    @Column(columnDefinition = "TEXT")
    private String researchGap;

    /** Comma-separated keywords */
    @Column(nullable = false)
    private String keywords;

    /** Subcategory related to the submission (Optional) */
    private String subcategory;

    /** Category (Optional, inherited from student) */
    private String category;

    /** Name of the submitting student */
    @Column(nullable = false)
    private String studentName;

    /** Email of the submitting student */
    private String studentEmail;

    /** Requested supervisor's email */
    @Column(nullable = false)
    private String supervisorEmail;

    /** Additional comments for the reviewer (Optional) */
    @Column(columnDefinition = "TEXT")
    private String comments;

    /** Filename of the uploaded PDF manuscript */
    private String pdfFileName;

    /** Status: DRAFT, SUBMITTED, PENDING, APPROVED, REJECTED */
    @Column(nullable = false)
    private String status;

    private Double reviewTimeDays;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    /**
     * Relationship mapping: Registered student primary key is used as a foreign key.
     * Demonstrates OOP composition/relationship concepts.
     */
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = true)
    private Student student;
}
