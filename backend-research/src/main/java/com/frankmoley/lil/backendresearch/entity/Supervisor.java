package com.frankmoley.lil.backendresearch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "supervisor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Supervisor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String nicNumber;

    private String dateOfBirth;

    @Column(nullable = false, unique = true)
    private String email;

    private String phoneNumber;

    private String gender;

    private String university;

    private String faculty;

    private String department;

    private String academicPosition;

    private String employeeId;

    private String highestQualification;

    @Column(columnDefinition = "TEXT")
    private String previouslyCompletedDegreesJson;

    private String yearsOfTeachingExperience;

    private String yearsOfResearchExperience;

    @Column(columnDefinition = "TEXT")
    private String professionalBiography;

    private String researchCategory;

    @Column(columnDefinition = "TEXT")
    private String researchSubcategoriesJson;

    @Column(columnDefinition = "TEXT")
    private String researchInterests;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "supervisor";

    @Column(name = "is_available", nullable = false, columnDefinition = "boolean default true")
    private Boolean available = true;

    @Column(name = "registered_date")
    private java.time.LocalDateTime registeredDate = java.time.LocalDateTime.now();
}
