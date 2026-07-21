package com.frankmoley.lil.backendresearch.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String nicNumber;
    private String email;
    private String phoneNumber;
    private String university;
    private String registrationNumber;
    private String currentDegree;
    private String educationLevel;
    private String researchCategory;
    private String researchSubcategory;
    private String password;
    private String role;
}
