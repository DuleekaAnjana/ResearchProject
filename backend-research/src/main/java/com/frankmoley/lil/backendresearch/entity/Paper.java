package com.frankmoley.lil.backendresearch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "papers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String studentName;

    private String studentEmail;

    @Column(nullable = false)
    private String supervisorEmail;

    @Column(nullable = false)
    private String status; // APPROVED, PENDING, REJECTED

    private String category;

    private Double reviewTimeDays;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;
}
