package com.frankmoley.lil.backendresearch.config;

import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.entity.Student;
import com.frankmoley.lil.backendresearch.entity.User;
import com.frankmoley.lil.backendresearch.repository.PaperRepository;
import com.frankmoley.lil.backendresearch.repository.StudentRepository;
import com.frankmoley.lil.backendresearch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PaperRepository paperRepository;

    @Override
    public void run(String... args) throws Exception {
        String defaultHashedPassword = hashPassword("password123");

        // Seed default Demo Supervisor if not exists
        if (!userRepository.existsByEmail("demo@researchsphere.edu")) {
            User supervisor = new User();
            supervisor.setFullName("Prof. R. Silva");
            supervisor.setEmail("demo@researchsphere.edu");
            supervisor.setPassword(defaultHashedPassword);
            supervisor.setRole("supervisor");
            supervisor.setUniversity("University of Colombo");
            supervisor.setResearchCategory("Computer Science");
            supervisor.setResearchSubcategory("Artificial Intelligence");
            userRepository.save(supervisor);
        }

        // Seed default Demo Supervisor (alternative email)
        if (!userRepository.existsByEmail("supervisor@researchsphere.edu")) {
            User supervisor = new User();
            supervisor.setFullName("Prof. B. Perera");
            supervisor.setEmail("supervisor@researchsphere.edu");
            supervisor.setPassword(defaultHashedPassword);
            supervisor.setRole("supervisor");
            supervisor.setUniversity("University of Colombo");
            supervisor.setResearchCategory("Computer Science");
            userRepository.save(supervisor);
        }

        // Seed default Demo Student in `student` table
        if (!studentRepository.existsByEmail("student@researchsphere.edu")) {
            Student student = new Student();
            student.setFullName("Amara Perera");
            student.setEmail("student@researchsphere.edu");
            student.setPassword(defaultHashedPassword);
            student.setRole("student");
            student.setUniversity("University of Colombo");
            student.setRegistrationNumber("2024/CS/1001");
            studentRepository.save(student);
        }

        // Seed Papers if empty
        if (paperRepository.count() == 0) {
            String supervisorEmail = "demo@researchsphere.edu";
            LocalDateTime now = LocalDateTime.now();

            List<Paper> samplePapers = List.of(
                createPaper("Transformer-Based Approaches for Low-Resource Sinhala NLP", "Amara Perera", "amara@student.edu", supervisorEmail, "APPROVED", "Computer Science", 2.1, now.minusDays(10)),
                createPaper("Federated Learning for Privacy-Preserving Medical Imaging", "Amara Perera", "amara@student.edu", supervisorEmail, "APPROVED", "Medicine", 2.5, now.minusDays(8)),
                createPaper("A Bayesian Framework for Rainfall Prediction in South Asia", "Amara Perera", "amara@student.edu", supervisorEmail, "APPROVED", "Statistics", 2.8, now.minusDays(6)),
                createPaper("Blockchain-Backed Digital Credentials for University Certifications", "Amara Perera", "amara@student.edu", supervisorEmail, "APPROVED", "Computer Science", 2.2, now.minusDays(5)),
                createPaper("Deep Reinforcement Learning for Autonomous Warehouse Robotics", "Amara Perera", "amara@student.edu", supervisorEmail, "APPROVED", "Engineering", 2.4, now.minusDays(3)),
                createPaper("Solar-Powered Micro-Irrigation Systems for Smallholder Farms", "Amara Perera", "amara@student.edu", supervisorEmail, "APPROVED", "Engineering", 2.6, now.minusDays(2)),
                createPaper("Multi-Modal Sentiment Analysis for Code-Switched Social Media", "Kasun Fernando", "kasun@student.edu", supervisorEmail, "PENDING", "Computer Science", null, now.minusDays(1)),
                createPaper("Energy-Efficient Edge Computing in IoT Healthcare Systems", "Nipuni Silva", "nipuni@student.edu", supervisorEmail, "REJECTED", "Medicine", 1.9, now.minusDays(12))
            );

            paperRepository.saveAll(samplePapers);
        }
    }

    private Paper createPaper(String title, String studentName, String studentEmail, String supervisorEmail, String status, String category, Double reviewTime, LocalDateTime submittedAt) {
        Paper paper = new Paper();
        paper.setTitle(title);
        paper.setStudentName(studentName);
        paper.setStudentEmail(studentEmail);
        paper.setSupervisorEmail(supervisorEmail);
        paper.setStatus(status);
        paper.setCategory(category);
        paper.setReviewTimeDays(reviewTime);
        paper.setSubmittedAt(submittedAt);
        return paper;
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return password;
        }
    }
}
