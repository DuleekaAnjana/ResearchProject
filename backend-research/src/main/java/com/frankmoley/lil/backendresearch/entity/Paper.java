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

    /** Email of the submitting student */
    private String studentEmail;

    /** Requested supervisor's email */
    @Column(name = "stu_requested_supervisor_email", nullable = false)
    private String stuRequestedSupervisorEmail;

    @Column(name = "assigned_supervisor_email")
    private String assignedSupervisorEmail;

    private String supervisorName;

    /** Additional comments for the reviewer (Optional) */
    @Column(columnDefinition = "TEXT")
    private String comments;

    /** Filename of the uploaded PDF manuscript */
    @Column(name = "uploaded_manuscript")
    private String uploadedManuscript;

    @Lob
    @Column(name = "pdf_data", columnDefinition = "LONGBLOB")
    private byte[] pdfData;

    @Transient
    private String pdfBase64;

    private Integer pages;

    private Integer views = 0;

    private Integer downloads = 0;

    @Column(name = "supervisor_approval_status")
    private String supervisorApprovalStatus;

    @Column(name = "admin_approval_status")
    private String adminApprovalStatus;

    @Column(name = "is_published")
    private Boolean isPublished = false;

    @Column(columnDefinition = "TEXT")
    private String researchDirection;

    @Column(columnDefinition = "TEXT")
    private String researchGapFeedback;

    @Column(columnDefinition = "TEXT")
    private String missingFindings;

    private Integer satisfactionLevel;

    private LocalDateTime submittedAt;

    @Column(name = "admin_reviewed_at")
    private LocalDateTime adminReviewedAt;

    private LocalDateTime adminValidatedAt;

    private LocalDateTime duplicateCheckedAt;

    private LocalDateTime supervisorAssignedAt;

    private LocalDateTime underReviewAt;

    private LocalDateTime publishedAt;

    @Column(name = "supervisor_decide_at")
    private LocalDateTime supervisorDecideAt;

    @Transient
    private String studentName;

    @Transient
    private String formattedPublicationId;

    @Transient
    private String studentUniversity;

    @Transient
    public String getStudentUniversity() {
        return this.studentUniversity;
    }

    public void setStudentUniversity(String studentUniversity) {
        this.studentUniversity = studentUniversity;
    }

    @Transient
    public String getFormattedPublicationId() {
        return this.formattedPublicationId;
    }

    public void setFormattedPublicationId(String formattedPublicationId) {
        this.formattedPublicationId = formattedPublicationId;
    }

    @Transient
    public String getStudentName() {
        return this.studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    @Transient
    public String getStatus() {
        return this.supervisorApprovalStatus != null ? this.supervisorApprovalStatus : "PENDING";
    }

    public void setStatus(String status) {
        this.supervisorApprovalStatus = status;
    }

    @Transient
    public String getPdfFileName() {
        return this.uploadedManuscript;
    }

    public void setPdfFileName(String pdfFileName) {
        this.uploadedManuscript = pdfFileName;
    }

    @Transient
    public String getSupervisorEmail() {
        return this.assignedSupervisorEmail != null ? this.assignedSupervisorEmail : this.stuRequestedSupervisorEmail;
    }

    public void setSupervisorEmail(String supervisorEmail) {
        this.assignedSupervisorEmail = supervisorEmail;
    }

    @Transient
    public LocalDateTime getReviewedAt() {
        return this.adminReviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.adminReviewedAt = reviewedAt;
    }
}
