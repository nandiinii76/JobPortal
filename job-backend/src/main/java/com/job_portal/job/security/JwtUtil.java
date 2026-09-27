package com.job_portal.job.security;

import java.util.Date;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class JwtUtil {

    // =====================================================
    // SECRET KEY
    // =====================================================

   private static final String SECRET = System.getenv("JWT_SECRET");
   


    private final Key key =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes(StandardCharsets.UTF_8)
            );


    // =====================================================
    // TOKEN EXPIRATION
    // =====================================================

    private final long EXPIRATION_TIME =
            1000 * 60 * 60 * 24; // 24 hours


    // =====================================================
    // GENERATE TOKEN
    // =====================================================

    public String generateToken(
            String username,
            String role) {

        return Jwts.builder()

                .setSubject(username)

                .claim("role", role)

                .setIssuedAt(new Date())

                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION_TIME
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
    // EXTRACT CLAIMS
    // =====================================================

    private Claims extractAllClaims(String token) {

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

            String extractedUsername =
                    extractUsername(token);

            return extractedUsername.equals(username)
                    && !isTokenExpired(token);

        } catch (Exception e) {

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

        return expiration.before(new Date());
    }
}