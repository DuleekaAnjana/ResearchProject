package com.frankmoley.lil.backendresearch.controller;

import com.frankmoley.lil.backendresearch.dto.SupervisorDashboardDTO;
import com.frankmoley.lil.backendresearch.entity.Supervisor;
import com.frankmoley.lil.backendresearch.repository.SupervisorRepository;
import com.frankmoley.lil.backendresearch.service.SupervisorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/supervisor")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SupervisorController {

    private final SupervisorService supervisorService;
    private final SupervisorRepository supervisorRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<SupervisorDashboardDTO> getDashboard(@RequestParam(required = false) String email) {
        SupervisorDashboardDTO dashboard = supervisorService.getDashboardData(email);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/profile")
    public ResponseEntity<Supervisor> getProfile(@RequestParam String email) {
        return supervisorRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<Supervisor> updateProfile(@RequestBody Supervisor updated) {
        return supervisorRepository.findByEmail(updated.getEmail())
                .map(existing -> {
                    existing.setFullName(updated.getFullName());
                    existing.setNicNumber(updated.getNicNumber());
                    existing.setPhoneNumber(updated.getPhoneNumber());
                    existing.setUniversity(updated.getUniversity());
                    existing.setEmployeeId(updated.getEmployeeId());
                    existing.setHighestQualification(updated.getHighestQualification());
                    existing.setAcademicPosition(updated.getAcademicPosition());
                    existing.setPreviouslyCompletedDegreesJson(updated.getPreviouslyCompletedDegreesJson());
                    existing.setFaculty(updated.getFaculty()); // Used for Previous Universities
                    existing.setResearchCategory(updated.getResearchCategory());
                    existing.setResearchSubcategoriesJson(updated.getResearchSubcategoriesJson());
                    existing.setProfessionalBiography(updated.getProfessionalBiography());
                    if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
                        existing.setPassword(updated.getPassword());
                    }
                    return ResponseEntity.ok(supervisorRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
