package com.frankmoley.lil.backendresearch.repository;

import com.frankmoley.lil.backendresearch.entity.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupervisorRepository extends JpaRepository<Supervisor, Long> {
    Optional<Supervisor> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNicNumber(String nicNumber);
}
