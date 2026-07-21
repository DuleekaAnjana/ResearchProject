package com.frankmoley.lil.backendresearch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private Long id;
    private String name;
    private String email;
    private String role;
    private String university;
}
