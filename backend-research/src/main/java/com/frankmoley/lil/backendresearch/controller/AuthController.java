package com.frankmoley.lil.backendresearch.controller;

import com.frankmoley.lil.backendresearch.dto.AuthResponse;
import com.frankmoley.lil.backendresearch.dto.LoginRequest;
import com.frankmoley.lil.backendresearch.dto.RegisterRequest;
import com.frankmoley.lil.backendresearch.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        if (email == null || currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "All fields are required."));
        }
        boolean success = authService.changePassword(email, currentPassword, newPassword);
        if (!success) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Incorrect current password."));
        }
        return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully!"));
    }

    @GetMapping("/student-profile")
    public ResponseEntity<?> getStudentProfile(@RequestParam String email) {
        return authService.getStudentProfile(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/check-nic")
    public ResponseEntity<Boolean> checkNic(@RequestParam("nic") String nic) {
        return ResponseEntity.ok(authService.isNicRegistered(nic));
    }
}
