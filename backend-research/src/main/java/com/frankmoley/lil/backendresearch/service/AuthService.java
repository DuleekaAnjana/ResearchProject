package com.frankmoley.lil.backendresearch.service;

import com.frankmoley.lil.backendresearch.dto.AuthResponse;
import com.frankmoley.lil.backendresearch.dto.LoginRequest;
import com.frankmoley.lil.backendresearch.dto.RegisterRequest;
import com.frankmoley.lil.backendresearch.entity.Admin;
import com.frankmoley.lil.backendresearch.entity.Student;
import com.frankmoley.lil.backendresearch.entity.User;
import com.frankmoley.lil.backendresearch.entity.Supervisor;
import com.frankmoley.lil.backendresearch.repository.AdminRepository;
import com.frankmoley.lil.backendresearch.repository.StudentRepository;
import com.frankmoley.lil.backendresearch.repository.UserRepository;
import com.frankmoley.lil.backendresearch.repository.SupervisorRepository;
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
    private final SupervisorRepository supervisorRepository;
    private final AdminRepository adminRepository;
    private final NotificationService notificationService;

    public AuthResponse register(RegisterRequest request) {
        if (studentRepository.existsByEmail(request.getEmail()) 
                || userRepository.existsByEmail(request.getEmail())
                || supervisorRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Email address is already registered.")
                    .build();
        }

        if (request.getNicNumber() != null && !request.getNicNumber().trim().isEmpty()) {
            String cleanNic = request.getNicNumber().trim();
            if (studentRepository.existsByNicNumber(cleanNic) 
                    || userRepository.existsByNicNumber(cleanNic)
                    || supervisorRepository.existsByNicNumber(cleanNic)) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Entered NIC is already registered.")
                        .build();
            }
        }

        String hashedPassword = hashPassword(request.getPassword());

        if ("student".equalsIgnoreCase(request.getRole()) || request.getRole() == null) {
            Student student = new Student();
            student.setFullName(request.getFullName());
            student.setNicNumber(request.getNicNumber());
            student.setDateOfBirth(request.getDateOfBirth());
            student.setEmail(request.getEmail());
            student.setPhoneNumber(request.getPhoneNumber());
            student.setGender(request.getGender());
            student.setUniversity(request.getUniversity());
            student.setFaculty(request.getFaculty());
            student.setDepartment(request.getDepartment());
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

            Student savedStudent = studentRepository.save(student);

            notificationService.createNotification(
                savedStudent.getEmail(),
                "Welcome to ResearchSphere",
                "Hello " + savedStudent.getFullName() + ", welcome to ResearchSphere! Start uploading your research papers now.",
                "SYSTEM"
            );

            return AuthResponse.builder()
                    .success(true)
                    .message("Student registration successful!")
                    .id(savedStudent.getId())
                    .name(savedStudent.getFullName())
                    .email(savedStudent.getEmail())
                    .role("student")
                    .university(savedStudent.getUniversity())
                    .researchCategory(savedStudent.getResearchCategory())
                    .build();
        } else if ("supervisor".equalsIgnoreCase(request.getRole())) {
            Supervisor supervisor = new Supervisor();
            supervisor.setFullName(request.getFullName());
            supervisor.setNicNumber(request.getNicNumber());
            supervisor.setDateOfBirth(request.getDateOfBirth());
            supervisor.setEmail(request.getEmail());
            supervisor.setPhoneNumber(request.getPhoneNumber());
            supervisor.setGender(request.getGender());
            supervisor.setUniversity(request.getUniversity());
            supervisor.setFaculty(request.getFaculty());
            supervisor.setDepartment(request.getDepartment());
            supervisor.setAcademicPosition(request.getAcademicPosition());
            supervisor.setEmployeeId(request.getEmployeeId());
            supervisor.setHighestQualification(request.getHighestQualification());

            if (request.getPreviousDegrees() != null && !request.getPreviousDegrees().isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (RegisterRequest.PreviousDegreeDTO deg : request.getPreviousDegrees()) {
                    sb.append(deg.getDegree()).append(" (").append(deg.getUniversity()).append("); ");
                }
                supervisor.setPreviouslyCompletedDegreesJson(sb.toString());
            }

            supervisor.setYearsOfTeachingExperience(request.getYearsOfTeachingExperience());
            supervisor.setYearsOfResearchExperience(request.getYearsOfResearchExperience());
            supervisor.setProfessionalBiography(request.getProfessionalBiography());
            supervisor.setResearchCategory(request.getResearchCategory());

            if (request.getResearchSubcategories() != null && !request.getResearchSubcategories().isEmpty()) {
                supervisor.setResearchSubcategoriesJson(String.join(", ", request.getResearchSubcategories()));
            } else if (request.getResearchSubcategory() != null) {
                supervisor.setResearchSubcategoriesJson(request.getResearchSubcategory());
            }

            supervisor.setResearchInterests(request.getResearchInterests());
            supervisor.setPassword(hashedPassword);
            supervisor.setRole("supervisor");

            Supervisor savedSupervisor = supervisorRepository.save(supervisor);

            notificationService.createNotification(
                savedSupervisor.getEmail(),
                "Welcome to ResearchSphere",
                "Hello " + savedSupervisor.getFullName() + ", welcome to ResearchSphere as a supervisor!",
                "SYSTEM"
            );

            return AuthResponse.builder()
                    .success(true)
                    .message("Supervisor registration successful!")
                    .id(savedSupervisor.getId())
                    .name(savedSupervisor.getFullName())
                    .email(savedSupervisor.getEmail())
                    .role("supervisor")
                    .university(savedSupervisor.getUniversity())
                    .researchCategory(savedSupervisor.getResearchCategory())
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

            notificationService.createNotification(
                savedUser.getEmail(),
                "Welcome to ResearchSphere",
                "Hello " + savedUser.getFullName() + ", welcome to ResearchSphere!",
                "SYSTEM"
            );

            return AuthResponse.builder()
                    .success(true)
                    .message("Registration successful!")
                    .id(savedUser.getId())
                    .name(savedUser.getFullName())
                    .email(savedUser.getEmail())
                    .role(savedUser.getRole())
                    .university(savedUser.getUniversity())
                    .researchCategory(savedUser.getResearchCategory())
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
                        .researchCategory(student.getResearchCategory())
                        .build();
            }
        }

        Optional<Supervisor> supervisorOpt = supervisorRepository.findByEmail(request.getEmail());
        if (supervisorOpt.isPresent()) {
            Supervisor supervisor = supervisorOpt.get();
            if (supervisor.getPassword().equals(hashedPassword) || supervisor.getPassword().equals(request.getPassword())) {
                return AuthResponse.builder()
                        .success(true)
                        .message("Login successful!")
                        .id(supervisor.getId())
                        .name(supervisor.getFullName())
                        .email(supervisor.getEmail())
                        .role("supervisor")
                        .university(supervisor.getUniversity())
                        .researchCategory(supervisor.getResearchCategory())
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
                        .researchCategory(user.getResearchCategory())
                        .build();
            }
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(request.getEmail());
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (admin.getPassword().equals(hashedPassword) || admin.getPassword().equals(request.getPassword())) {
                return AuthResponse.builder()
                        .success(true)
                        .message("Login successful!")
                        .id(admin.getId())
                        .name(admin.getFullName())
                        .email(admin.getEmail())
                        .role(admin.getRole())
                        .build();
            }
        }

        return AuthResponse.builder()
                .success(false)
                .message("Invalid email or password.")
                .build();
    }

    public boolean isNicRegistered(String nic) {
        if (nic == null || nic.trim().isEmpty()) return false;
        String cleanNic = nic.trim();
        return studentRepository.existsByNicNumber(cleanNic) 
                || userRepository.existsByNicNumber(cleanNic)
                || supervisorRepository.existsByNicNumber(cleanNic);
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
