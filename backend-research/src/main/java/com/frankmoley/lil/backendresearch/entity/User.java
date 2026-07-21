package com.frankmoley.lil.backendresearch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String nicNumber;

    @Column(nullable = false, unique = true)
    private String email;

    private String phoneNumber;

    private String university;

    private String registrationNumber;

    private String currentDegree;

    private String educationLevel;

    private String researchCategory;

    private String researchSubcategory;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // 'student', 'supervisor', 'user_admin', 'repo_admin'
}
