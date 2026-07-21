package com.frankmoley.lil.backendresearch.controller;

import com.frankmoley.lil.backendresearch.dto.SupervisorDashboardDTO;
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

    @GetMapping("/dashboard")
    public ResponseEntity<SupervisorDashboardDTO> getDashboard(@RequestParam(required = false) String email) {
        SupervisorDashboardDTO dashboard = supervisorService.getDashboardData(email);
        return ResponseEntity.ok(dashboard);
    }
}
