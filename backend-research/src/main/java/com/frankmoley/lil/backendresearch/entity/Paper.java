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
    @Column(name = "publication_id", unique = true, nullable = false)
    private Long publicationId;

    public Long getId() {
        return this.publicationId;
    }

    public void setId(Long id) {
        this.publicationId = id;
    }

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

    private String supervisorName;

    /** Additional comments for the reviewer (Optional) */
    @Column(columnDefinition = "TEXT")
    private String comments;

    /** Filename of the uploaded PDF manuscript */
    private String pdfFileName;

    private Integer pages;

    private Integer views = 0;

    private Integer downloads = 0;

    /** Status: DRAFT, SUBMITTED, PENDING, APPROVED, REJECTED */
    @Column(name = "supervisor_approval_status", nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String researchDirection;

    @Column(columnDefinition = "TEXT")
    private String researchGapFeedback;

    @Column(columnDefinition = "TEXT")
    private String missingFindings;

    private Integer satisfactionLevel;

    private Double reviewTimeDays;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    private LocalDateTime adminValidatedAt;

    private LocalDateTime duplicateCheckedAt;

    private LocalDateTime supervisorAssignedAt;

    private LocalDateTime underReviewAt;

    private LocalDateTime publishedAt;

    /**
     * Relationship mapping: Registered student primary key is used as a foreign key.
     * Demonstrates OOP composition/relationship concepts.
     */
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = true)
    private Student student;
}
