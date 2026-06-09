package com.campusreuse.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Helper for creating and validating JWTs using the newer JJWT API.
 * The secret key is loaded from application.yml (property: jwt.secret).
 */
@Component
public class JwtUtil {

    private final Key key;
    private final long JWT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 h

    public JwtUtil(@org.springframework.beans.factory.annotation.Value("${jwt.secret}") String secret) {
        // The secret must be at least 256 bits for HS256
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    /** Create a JWT containing the username (email) as the subject. */
    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)   // modern style
                .compact();
    }

    /** Validate the token against a username. */
    public boolean validateToken(String token, String username) {
        return username.equals(extractUsername(token)) && !isTokenExpired(token);
    }

    /** Extract the username (subject) from the token. */
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return expiration.before(new Date());
    }
}
