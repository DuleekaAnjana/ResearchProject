package com.frankmoley.lil.backendresearch.repository;

import com.frankmoley.lil.backendresearch.entity.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperRepository extends JpaRepository<Paper, Long> {
    List<Paper> findByAssignedSupervisorEmail(String email);
    List<Paper> findByAssignedSupervisorEmailOrderBySubmittedAtDesc(String email);
    List<Paper> findByStuRequestedSupervisorEmailOrderBySubmittedAtDesc(String email);
    long countByAssignedSupervisorEmail(String email);
    long countByAssignedSupervisorEmailAndSupervisorApprovalStatus(String email, String status);
}
