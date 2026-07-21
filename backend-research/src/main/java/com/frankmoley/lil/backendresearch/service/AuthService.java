package com.frankmoley.lil.backendresearch.service;

import com.frankmoley.lil.backendresearch.dto.AuthResponse;
import com.frankmoley.lil.backendresearch.dto.LoginRequest;
import com.frankmoley.lil.backendresearch.dto.RegisterRequest;
import com.frankmoley.lil.backendresearch.entity.User;
import com.frankmoley.lil.backendresearch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email address is already registered.")
                    .build();
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setNicNumber(request.getNicNumber());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setUniversity(request.getUniversity());
        user.setRegistrationNumber(request.getRegistrationNumber());
        user.setCurrentDegree(request.getCurrentDegree());
        user.setEducationLevel(request.getEducationLevel());
        user.setResearchCategory(request.getResearchCategory());
        user.setResearchSubcategory(request.getResearchSubcategory());
        user.setPassword(request.getPassword()); // Plain password for prototype
        user.setRole(request.getRole() != null ? request.getRole() : "student");

        User savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message("Registration successful!")
                .id(savedUser.getId())
                .name(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .university(savedUser.getUniversity())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password.")
                    .build();
        }

        User user = userOptional.get();
        if (!user.getPassword().equals(request.getPassword())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or password.")
                    .build();
        }

        return AuthResponse.builder()
                .success(true)
                .message("Login successful!")
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .university(user.getUniversity())
                .build();
    }
}
