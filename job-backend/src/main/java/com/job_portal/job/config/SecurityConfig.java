package com.job_portal.job.config;

import com.job_portal.job.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // =================================================
            // CORS
            // =================================================

            .cors(cors -> {})

            // =================================================
            // CSRF
            // =================================================

            .csrf(csrf -> csrf.disable())

            // =================================================
            // STATELESS SESSION
            // =================================================

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // =================================================
            // AUTHORIZATION
            // =================================================

            .authorizeHttpRequests(auth -> auth

                // =================================================
                // PUBLIC AUTHENTICATION
                // =================================================

                .requestMatchers(
                    "/users/register",
                    "/users/login"
                ).permitAll()

                // =================================================
                // PUBLIC GENERAL
                // =================================================

                .requestMatchers(
                    "/",
                    "/test"
                ).permitAll()

                // =================================================
                // PUBLIC JOB BROWSING
                // =================================================

                /*
                 * GET /jobs
                 * GET /jobs/{id}
                 * GET /jobs/search
                 * GET /jobs/count
                 * GET /jobs/employer/{id}
                 *
                 * are public.
                 *
                 * POST /jobs
                 * PUT /jobs/{id}
                 * DELETE /jobs/{id}
                 *
                 * are protected by @PreAuthorize in JobController.
                 */

                .requestMatchers(
                    "/jobs",
                    "/jobs/*",
                    "/jobs/search",
                    "/jobs/count",
                    "/jobs/employer/**"
                ).permitAll()

                // =================================================
                // PUBLIC COMPANY PAGES
                // =================================================

                .requestMatchers(
                    "/company/**"
                ).permitAll()

                // =================================================
                // APPLICATION APIs
                // =================================================

                // -------------------------------------------------
                // JOB SEEKER
                // -------------------------------------------------

                .requestMatchers(
                    "/applications/apply/**",
                    "/applications/my",
                    "/applications/user/**"
                ).hasRole("JOB_SEEKER")

                // -------------------------------------------------
                // EMPLOYER / RECRUITER
                // -------------------------------------------------

                .requestMatchers(
                    "/applications/job/**",
                    "/applications/employer",
                    "/applications/employer/**",
                    "/applications/*/status",
                    "/applications/status/**"
                ).hasAnyRole(
                    "EMPLOYER",
                    "RECRUITER"
                )

                // -------------------------------------------------
                // APPLICATION ANALYTICS
                // -------------------------------------------------

                .requestMatchers(
                    "/applications/analytics/**"
                ).hasAnyRole(
                    "EMPLOYER",
                    "RECRUITER",
                    "ADMIN",
                    "SUPER_ADMIN"
                )

                // -------------------------------------------------
                // APPLICATION COUNT
                // -------------------------------------------------

                .requestMatchers(
                    "/applications/count"
                ).hasAnyRole(
                    "ADMIN",
                    "SUPER_ADMIN"
                )

                // -------------------------------------------------
                // SPECIFIC APPLICATION
                // -------------------------------------------------

                .requestMatchers(
                    "/applications/*"
                ).authenticated()

                // =================================================
                // SAVED JOBS
                // =================================================

                .requestMatchers(
                    "/saved-jobs/**",
                    "/saved/**"
                ).hasRole("JOB_SEEKER")

                // =================================================
                // RESUME
                // =================================================

                .requestMatchers(
                    "/resume/**"
                ).hasRole("JOB_SEEKER")

                // =================================================
                // INTERVIEWS
                // =================================================

                .requestMatchers(
                    "/interviews/my/**"
                ).hasRole("JOB_SEEKER")

                .requestMatchers(
                    "/interviews/employer/**"
                ).hasAnyRole(
                    "EMPLOYER",
                    "RECRUITER"
                )

                // =================================================
                // EMPLOYER
                // =================================================

                .requestMatchers(
                    "/employer/**",
                    "/dashboard/employer/**"
                ).hasAnyRole(
                    "EMPLOYER",
                    "RECRUITER"
                )

                // =================================================
                // ANALYTICS
                // =================================================

                .requestMatchers(
                    "/analytics/**"
                ).hasAnyRole(
                    "EMPLOYER",
                    "RECRUITER"
                )

                // =================================================
                // RECRUITER
                // =================================================

                .requestMatchers(
                    "/recruiter/**"
                ).hasRole("RECRUITER")

                // =================================================
                // ADMIN
                // =================================================

                .requestMatchers(
                    "/admin/**"
                ).hasAnyRole(
                    "ADMIN",
                    "SUPER_ADMIN"
                )

                // =================================================
                // NOTIFICATIONS
                // =================================================

                .requestMatchers(
                    "/notifications/**"
                ).authenticated()

                // =================================================
                // USER PROFILE
                // =================================================

                .requestMatchers(
                    "/users/**"
                ).authenticated()

                // =================================================
                // EVERYTHING ELSE
                // =================================================

                .anyRequest()
                .authenticated()
            )

            // =================================================
            // JWT FILTER
            // =================================================

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}