package com.campusreuse.backend.controller;

import com.campusreuse.backend.model.User;
import com.campusreuse.backend.repository.UserRepository;
import com.campusreuse.backend.security.JwtUtil;
import lombok.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /** DTOs */
    @Getter @Setter static class AuthRequest {
        private String email;
        private String password;
    }
    @Getter @AllArgsConstructor static class AuthResponse {
        private String token;
    }

    // --------- Register ----------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        if (!req.getEmail().endsWith("@coeptech.ac.in")) {
            return ResponseEntity.badRequest()
                    .body("Only @coeptech.ac.in email addresses are allowed");
        }
        if (userRepo.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User already exists");
        }
        String hashed = encoder.encode(req.getPassword());
        userRepo.save(new User(null, req.getEmail(), hashed));
        return ResponseEntity.ok("Registered");
    }

    // --------- Login ----------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        String token = jwtUtil.generateToken(req.getEmail());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
