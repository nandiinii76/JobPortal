package com.job_portal.job.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private final Key key;
    private final long expirationTime;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationTime) {

        if (secret == null || secret.trim().length() < 32) {
            throw new IllegalStateException(
                    "JWT secret must be at least 32 characters long"
            );
        }

        if (expirationTime <= 0) {
            throw new IllegalStateException(
                    "JWT expiration time must be greater than 0"
            );
        }

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expirationTime = expirationTime;
    }

    // =====================================================
    // GENERATE TOKEN
    // =====================================================

    public String generateToken(
            String username,
            String role) {

        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Username is required to generate JWT"
            );
        }

        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Role is required to generate JWT"
            );
        }

        String normalizedRole = normalizeRole(role);

        return Jwts.builder()
                .setSubject(username.trim())
                .claim("role", normalizedRole)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expirationTime
                        )
                )
                .signWith(
                        key,
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // =====================================================
    // EXTRACT USERNAME
    // =====================================================

    public String extractUsername(String token) {

        return extractAllClaims(token)
                .getSubject();
    }

    // =====================================================
    // EXTRACT ROLE
    // =====================================================

    public String extractRole(String token) {

        return extractAllClaims(token)
                .get("role", String.class);
    }

    // =====================================================
    // EXTRACT ALL CLAIMS
    // =====================================================

    private Claims extractAllClaims(String token) {

        if (token == null || token.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "JWT token is required"
            );
        }

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // =====================================================
    // VALIDATE TOKEN
    // =====================================================

    public boolean validateToken(
            String token,
            String username) {

        try {

            if (token == null ||
                    token.trim().isEmpty() ||
                    username == null ||
                    username.trim().isEmpty()) {

                return false;
            }

            String extractedUsername =
                    extractUsername(token);

            return extractedUsername != null
                    && extractedUsername.equalsIgnoreCase(
                            username.trim()
                    )
                    && !isTokenExpired(token);

        } catch (Exception exception) {

            return false;
        }
    }

    // =====================================================
    // CHECK TOKEN EXPIRATION
    // =====================================================

    private boolean isTokenExpired(String token) {

        Date expiration =
                extractAllClaims(token)
                        .getExpiration();

        return expiration == null ||
                expiration.before(new Date());
    }

    // =====================================================
    // NORMALIZE ROLE
    // =====================================================

    private String normalizeRole(String role) {

        String normalizedRole =
                role.trim()
                        .toUpperCase(Locale.ROOT);

        if (normalizedRole.equals("USER") ||
                normalizedRole.equals("CANDIDATE") ||
                normalizedRole.equals("JOBSEEKER") ||
                normalizedRole.equals("JOB_SEEKER") ||
                normalizedRole.equals("ROLE_USER") ||
                normalizedRole.equals("ROLE_CANDIDATE") ||
                normalizedRole.equals("ROLE_JOBSEEKER") ||
                normalizedRole.equals("ROLE_JOB_SEEKER")) {

            return "ROLE_JOB_SEEKER";
        }

        if (normalizedRole.equals("EMPLOYER") ||
                normalizedRole.equals("ROLE_EMPLOYER")) {

            return "ROLE_EMPLOYER";
        }

        if (normalizedRole.equals("RECRUITER") ||
                normalizedRole.equals("ROLE_RECRUITER")) {

            return "ROLE_RECRUITER";
        }

        if (normalizedRole.equals("ADMIN") ||
                normalizedRole.equals("ROLE_ADMIN")) {

            return "ROLE_ADMIN";
        }

        if (normalizedRole.equals("SUPER_ADMIN") ||
                normalizedRole.equals("ROLE_SUPER_ADMIN")) {

            return "ROLE_SUPER_ADMIN";
        }

        throw new IllegalArgumentException(
                "Invalid role for JWT: " + role
        );
    }
}