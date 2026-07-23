package com.frankmoley.lil.backendresearch.dto;

import lombok.Data;
import java.util.List;

@Data
public class RegisterRequest {
    private String fullName;
    private String nicNumber;
    private String dateOfBirth;
    private String email;
    private String phoneNumber;
    private String university;
    private String registrationNumber;
    private String currentDegree;
    private String educationLevel;
    private String previousDegreesJson;
    private List<PreviousDegreeDTO> previousDegrees;
    private String researchCategory;
    private String researchSubcategory;
    private List<String> researchSubcategories;
    private String password;
    private String role;

    // Supervisor Specific Fields
    private String gender;
    private String faculty;
    private String department;
    private String academicPosition;
    private String employeeId;
    private String highestQualification;
    private String yearsOfTeachingExperience;
    private String yearsOfResearchExperience;
    private String professionalBiography;
    private String researchInterests;

    @Data
    public static class PreviousDegreeDTO {
        private String degree;
        private String university;
        private String registrationNumber;
    }
}
