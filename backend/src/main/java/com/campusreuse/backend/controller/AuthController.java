package com.campusreuse.backend.controller;

import java.util.Collections;
import java.util.Map;

import com.campusreuse.backend.model.User;
import com.campusreuse.backend.repository.UserRepository;
import com.campusreuse.backend.security.JwtUtil;
import lombok.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;
    private final GoogleIdTokenVerifier verifier;

    public AuthController(JwtUtil jwtUtil,
                          UserRepository userRepo,
                          @Value("${google.client-id}") String googleClientId) {
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    // ======================== DTOs ========================

    @Getter @Setter
    static class GoogleAuthRequest {
        private String idToken;
    }

    @Getter @AllArgsConstructor
    static class AuthResponse {
        private String token;
        private UserDto user;
    }

    @Getter @AllArgsConstructor
    static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String profilePicture;
        private String role;
    }

    // ======================== Google Sign-In ========================

    @PostMapping("/google")
    public ResponseEntity<?> googleSignIn(@RequestBody GoogleAuthRequest req) {
        try {
            // 1. Verify the Google ID token
            GoogleIdToken idToken = verifier.verify(req.getIdToken());
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid Google token"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            // 2. Find or create user
            User user = userRepo.findByGoogleId(googleId)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                .googleId(googleId)
                                .email(email)
                                .name(name != null ? name : email)
                                .profilePicture(picture)
                                .role("jadhav2005.adi@gmail.com".equalsIgnoreCase(email) ? User.Role.ADMIN : User.Role.USER)
                                .build();
                        return userRepo.save(newUser);
                    });

            // Update profile info in case it changed on Google's side
            user.setName(name != null ? name : user.getName());
            user.setProfilePicture(picture);
            // Ensure admin role is always maintained for this email
            if ("jadhav2005.adi@gmail.com".equalsIgnoreCase(email)) {
                user.setRole(User.Role.ADMIN);
            }
            userRepo.save(user);

            // 3. Issue our own JWT
            String jwt = jwtUtil.generateToken(user.getEmail());

            UserDto userDto = new UserDto(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getProfilePicture(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(new AuthResponse(jwt, userDto));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Authentication failed: " + e.getMessage()));
        }
    }

    // ======================== Get Current User ========================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractUsername(token);
            User user = userRepo.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }
            UserDto dto = new UserDto(
                    user.getId(), user.getName(), user.getEmail(), user.getProfilePicture(), user.getRole().name());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }
    }
}
