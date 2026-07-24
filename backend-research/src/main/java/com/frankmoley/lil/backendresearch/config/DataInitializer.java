package com.frankmoley.lil.backendresearch.config;

import com.frankmoley.lil.backendresearch.entity.Notification;
import com.frankmoley.lil.backendresearch.entity.Paper;
import com.frankmoley.lil.backendresearch.entity.Student;
import com.frankmoley.lil.backendresearch.entity.User;
import com.frankmoley.lil.backendresearch.repository.NotificationRepository;
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
    private final NotificationRepository notificationRepository;

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
            student.setResearchCategory("Computer Science");
            studentRepository.save(student);
        }

        // Seed Papers if empty
        if (paperRepository.count() == 0) {
            String supervisorEmail = "demo@researchsphere.edu";
            LocalDateTime now = LocalDateTime.now();
            Student amara = studentRepository.findByEmail("student@researchsphere.edu").orElse(null);

            List<Paper> samplePapers = List.of(
                createPaper(amara, "Transformer-Based Approaches for Low-Resource Sinhala NLP", "Amara Perera", "student@researchsphere.edu", supervisorEmail, "APPROVED", "Computer Science", 2.1, now.minusDays(10)),
                createPaper(amara, "Federated Learning for Privacy-Preserving Medical Imaging", "Amara Perera", "student@researchsphere.edu", supervisorEmail, "APPROVED", "Medicine", 2.5, now.minusDays(8)),
                createPaper(amara, "A Bayesian Framework for Rainfall Prediction in South Asia", "Amara Perera", "student@researchsphere.edu", supervisorEmail, "APPROVED", "Statistics", 2.8, now.minusDays(6)),
                createPaper(amara, "Blockchain-Backed Digital Credentials for University Certifications", "Amara Perera", "student@researchsphere.edu", supervisorEmail, "APPROVED", "Computer Science", 2.2, now.minusDays(5)),
                createPaper(amara, "Deep Reinforcement Learning for Autonomous Warehouse Robotics", "Amara Perera", "student@researchsphere.edu", supervisorEmail, "APPROVED", "Engineering", 2.4, now.minusDays(3)),
                createPaper(amara, "Solar-Powered Micro-Irrigation Systems for Smallholder Farms", "Amara Perera", "student@researchsphere.edu", supervisorEmail, "APPROVED", "Engineering", 2.6, now.minusDays(2)),
                createPaper(null, "Multi-Modal Sentiment Analysis for Code-Switched Social Media", "Kasun Fernando", "kasun@student.edu", supervisorEmail, "PENDING", "Computer Science", null, now.minusDays(1)),
                createPaper(null, "Energy-Efficient Edge Computing in IoT Healthcare Systems", "Nipuni Silva", "nipuni@student.edu", supervisorEmail, "REJECTED", "Medicine", 1.9, now.minusDays(12))
            );

            paperRepository.saveAll(samplePapers);
        }

        // Seed demo notifications for the demo student if none exist
        String studentEmail = "student@researchsphere.edu";
        if (notificationRepository.countByUserEmailAndIsRead(studentEmail, false) == 0
                && notificationRepository.findByUserEmailOrderByCreatedAtDesc(studentEmail).isEmpty()) {
            LocalDateTime baseTime = LocalDateTime.now();

            notificationRepository.saveAll(List.of(
                    Notification.builder()
                            .userEmail(studentEmail)
                            .title("Submission received")
                            .description("Your paper 'Explainable AI in Cardiovascular Risk Prediction' is under administrator validation.")
                            .type("SUBMISSION")
                            .isRead(false)
                            .createdAt(baseTime.minusDays(1))
                            .build(),
                    Notification.builder()
                            .userEmail(studentEmail)
                            .title("Supervisor assigned")
                            .description("Prof. Ranjith Silva has been assigned as your reviewer.")
                            .type("SUPERVISOR_ASSIGNED")
                            .isRead(false)
                            .createdAt(baseTime.minusDays(2))
                            .build(),
                    Notification.builder()
                            .userEmail(studentEmail)
                            .title("Feedback available")
                            .description("Supervisor feedback is available for your rejected submission.")
                            .type("FEEDBACK")
                            .isRead(false)
                            .createdAt(baseTime.minusDays(6))
                            .build(),
                    Notification.builder()
                            .userEmail(studentEmail)
                            .title("Paper approved")
                            .description("Congratulations! Your paper has been approved and is now published.")
                            .type("PAPER_APPROVED")
                            .isRead(true)
                            .createdAt(baseTime.minusDays(4))
                            .build(),
                    Notification.builder()
                            .userEmail(studentEmail)
                            .title("Paper approved")
                            .description("Your submission 'Transformer-Based Approaches for Low-Resource Sinhala NLP' was approved.")
                            .type("PAPER_APPROVED")
                            .isRead(true)
                            .createdAt(baseTime.minusDays(10))
                            .build(),
                    Notification.builder()
                            .userEmail(studentEmail)
                            .title("Paper approved")
                            .description("Your submission 'Federated Learning for Privacy-Preserving Medical Imaging' was approved.")
                            .type("PAPER_APPROVED")
                            .isRead(true)
                            .createdAt(baseTime.minusDays(8))
                            .build()
            ));
        }
    }

    private Paper createPaper(Student student, String title, String studentName, String studentEmail, String supervisorEmail, String status, String category, Double reviewTime, LocalDateTime submittedAt) {
        Paper paper = new Paper();
        paper.setTitle(title);
        paper.setStudentName(studentName);
        paper.setStudentEmail(studentEmail);
        paper.setSupervisorEmail(supervisorEmail);
        paper.setStatus(status);
        paper.setCategory(category);
        paper.setReviewTimeDays(reviewTime);
        paper.setSubmittedAt(submittedAt);
        if (submittedAt != null) {
            paper.setAdminValidatedAt(submittedAt.plusDays(2));
            paper.setDuplicateCheckedAt(submittedAt.plusDays(4));
            paper.setSupervisorAssignedAt(submittedAt.plusDays(6));
            paper.setUnderReviewAt(submittedAt.plusDays(8));
            if ("APPROVED".equalsIgnoreCase(status)) {
                paper.setReviewedAt(submittedAt.plusDays(10));
            }
        }
        paper.setAbstractText("This is the default abstract description for the research titled '" + title + "'. It addresses critical challenges and proposed methodologies.");
        paper.setKeywords("research, publication, Sinhala, Federated, Rainfall");
        paper.setStudent(student);
        // Add random pages, views, downloads
        paper.setPages((int) (Math.random() * 15) + 15);
        paper.setViews((int) (Math.random() * 3000) + 500);
        paper.setDownloads((int) (Math.random() * 800) + 50);
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
