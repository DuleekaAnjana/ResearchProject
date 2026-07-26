package com.frankmoley.lil.backendresearch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "student")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String nicNumber;

    private String dateOfBirth;

    @Column(nullable = false, unique = true)
    private String email;

    private String phoneNumber;

    private String gender;

    private String university;

    private String faculty;

    private String department;

    private String registrationNumber;

    private String currentDegree;

    private String educationLevel;

    @Column(columnDefinition = "TEXT")
    private String previousDegreesJson;

    private String researchCategory;

    @Column(columnDefinition = "TEXT")
    private String researchSubcategoriesJson;

    @Column(nullable = false)
    private String role = "student";

    @Column(nullable = false)
    private String password;
}
