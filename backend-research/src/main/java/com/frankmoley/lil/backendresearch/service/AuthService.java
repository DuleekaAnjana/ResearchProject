package com.frankmoley.lil.backendresearch.service;

import com.frankmoley.lil.backendresearch.dto.AuthResponse;
import com.frankmoley.lil.backendresearch.dto.LoginRequest;
import com.frankmoley.lil.backendresearch.dto.RegisterRequest;
import com.frankmoley.lil.backendresearch.entity.Student;
import com.frankmoley.lil.backendresearch.entity.User;
import com.frankmoley.lil.backendresearch.repository.StudentRepository;
import com.frankmoley.lil.backendresearch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public AuthResponse register(RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail()) || userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email address is already registered.")
                    .build();
        }

        String hashedPassword = hashPassword(request.getPassword());

        if ("student".equalsIgnoreCase(request.getRole()) || request.getRole() == null) {
            Student student = new Student();
            student.setFullName(request.getFullName());
            student.setNicNumber(request.getNicNumber());
            student.setDateOfBirth(request.getDateOfBirth());
            student.setEmail(request.getEmail());
            student.setPhoneNumber(request.getPhoneNumber());
            student.setUniversity(request.getUniversity());
            student.setRegistrationNumber(request.getRegistrationNumber());
            student.setCurrentDegree(request.getCurrentDegree());
            student.setEducationLevel(request.getEducationLevel());

            if (request.getPreviousDegrees() != null && !request.getPreviousDegrees().isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (RegisterRequest.PreviousDegreeDTO deg : request.getPreviousDegrees()) {
                    sb.append(deg.getDegree()).append(" (").append(deg.getUniversity()).append(", Reg: ").append(deg.getRegistrationNumber()).append("); ");
                }
                student.setPreviousDegreesJson(sb.toString());
            } else if (request.getPreviousDegreesJson() != null) {
                student.setPreviousDegreesJson(request.getPreviousDegreesJson());
            }

            if (request.getResearchSubcategories() != null && !request.getResearchSubcategories().isEmpty()) {
                student.setResearchSubcategoriesJson(String.join(", ", request.getResearchSubcategories()));
            } else if (request.getResearchSubcategory() != null) {
                student.setResearchSubcategoriesJson(request.getResearchSubcategory());
            }

            student.setResearchCategory(request.getResearchCategory());
            student.setPassword(hashedPassword);
            student.setRole("student");

            Student savedStudent = studentRepository.save(student);

            return AuthResponse.builder()
                    .success(true)
                    .message("Student registration successful!")
                    .id(savedStudent.getId())
                    .name(savedStudent.getFullName())
                    .email(savedStudent.getEmail())
                    .role("student")
                    .university(savedStudent.getUniversity())
                    .build();
        } else {
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
            user.setPassword(hashedPassword);
            user.setRole(request.getRole());

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
    }

    public AuthResponse login(LoginRequest request) {
        String hashedPassword = hashPassword(request.getPassword());

        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (student.getPassword().equals(hashedPassword) || student.getPassword().equals(request.getPassword())) {
                return AuthResponse.builder()
                        .success(true)
                        .message("Login successful!")
                        .id(student.getId())
                        .name(student.getFullName())
                        .email(student.getEmail())
                        .role("student")
                        .university(student.getUniversity())
                        .build();
            }
        }

        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(hashedPassword) || user.getPassword().equals(request.getPassword())) {
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

        return AuthResponse.builder()
                .success(false)
                .message("Invalid email or password.")
                .build();
    }

    private String hashPassword(String password) {
        if (password == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return password;
        }
    }
}
