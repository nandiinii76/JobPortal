package com.job_portal.job.security;

import java.io.IOException;
import java.util.Collections;
import java.util.Locale;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    // =====================================================
    // JWT FILTER
    // =====================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        // =================================================
        // NO AUTHORIZATION HEADER
        // =================================================

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        // =================================================
        // EXTRACT TOKEN
        // =================================================

        String token =
                authorizationHeader.substring(7).trim();

        if (token.isEmpty()) {

            filterChain.doFilter(request, response);
            return;
        }

        try {

            // =================================================
            // EXTRACT USERNAME
            // =================================================

            String username =
                    jwtUtil.extractUsername(token);

            // =================================================
            // CHECK EXISTING AUTHENTICATION
            // =================================================

            if (username != null &&
                    !username.trim().isEmpty() &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                // =============================================
                // VALIDATE TOKEN
                // =============================================

                if (jwtUtil.validateToken(
                        token,
                        username)) {

                    // =========================================
                    // EXTRACT ROLE
                    // =========================================

                    String role =
                            jwtUtil.extractRole(token);

                    // =========================================
                    // NORMALIZE ROLE
                    // =========================================

                    String authority =
                            normalizeRole(role);

                    // =========================================
                    // INVALID ROLE
                    // =========================================

                    if (authority == null) {

                        SecurityContextHolder.clearContext();

                        filterChain.doFilter(
                                request,
                                response
                        );

                        return;
                    }

                    // =========================================
                    // CREATE AUTHENTICATION
                    // =========================================

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(
                                            new SimpleGrantedAuthority(
                                                    authority
                                            )
                                    )
                            );

                    // =========================================
                    // STORE AUTHENTICATION
                    // =========================================

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );
                }
            }

        } catch (Exception exception) {

            // =================================================
            // INVALID JWT
            // =================================================

            SecurityContextHolder.clearContext();
        }

        // =====================================================
        // CONTINUE FILTER CHAIN
        // =====================================================

        filterChain.doFilter(
                request,
                response
        );
    }

    // =====================================================
    // NORMALIZE ROLE
    // =====================================================

    private String normalizeRole(String role) {

        if (role == null ||
                role.trim().isEmpty()) {

            return null;
        }

        String normalizedRole =
                role.trim().toUpperCase(Locale.ROOT);

        // =====================================================
        // JOB SEEKER
        // =====================================================

        if (normalizedRole.equals("USER") ||
                normalizedRole.equals("ROLE_USER") ||
                normalizedRole.equals("CANDIDATE") ||
                normalizedRole.equals("ROLE_CANDIDATE") ||
                normalizedRole.equals("JOBSEEKER") ||
                normalizedRole.equals("ROLE_JOBSEEKER") ||
                normalizedRole.equals("JOB_SEEKER") ||
                normalizedRole.equals("ROLE_JOB_SEEKER")) {

            return "ROLE_JOB_SEEKER";
        }

        // =====================================================
        // EMPLOYER
        // =====================================================

        if (normalizedRole.equals("EMPLOYER") ||
                normalizedRole.equals("ROLE_EMPLOYER")) {

            return "ROLE_EMPLOYER";
        }

        // =====================================================
        // RECRUITER
        // =====================================================

        if (normalizedRole.equals("RECRUITER") ||
                normalizedRole.equals("ROLE_RECRUITER")) {

            return "ROLE_RECRUITER";
        }

        // =====================================================
        // ADMIN
        // =====================================================

        if (normalizedRole.equals("ADMIN") ||
                normalizedRole.equals("ROLE_ADMIN")) {

            return "ROLE_ADMIN";
        }

        // =====================================================
        // SUPER ADMIN
        // =====================================================

        if (normalizedRole.equals("SUPER_ADMIN") ||
                normalizedRole.equals("ROLE_SUPER_ADMIN")) {

            return "ROLE_SUPER_ADMIN";
        }

        // =====================================================
        // UNKNOWN ROLE
        // =====================================================

        return null;
    }
}