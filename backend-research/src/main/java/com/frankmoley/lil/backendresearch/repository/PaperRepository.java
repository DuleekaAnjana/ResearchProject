package com.frankmoley.lil.backendresearch.repository;

import com.frankmoley.lil.backendresearch.entity.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long> {
    List<Paper> findBySupervisorEmail(String supervisorEmail);
    List<Paper> findBySupervisorEmailOrderBySubmittedAtDesc(String supervisorEmail);
    long countBySupervisorEmail(String supervisorEmail);
    long countBySupervisorEmailAndStatus(String supervisorEmail, String status);
}
