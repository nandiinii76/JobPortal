package com.job_portal.job.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.job_portal.job.security.JwtFilter;

@Configuration
public class SecurityConfig {

    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =====================================================
    // AUTHENTICATION MANAGER
    // =====================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtFilter jwtFilter) throws Exception {

        http

            // =================================================
            // CSRF
            // =================================================

            .csrf(csrf -> csrf.disable())

            // =================================================
            // CORS
            // =================================================

            .cors(cors -> {
            })

            // =================================================
            // SESSION
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
                // CHANGE PASSWORD
                // Logged-in users only
                // =================================================

                .requestMatchers(
                    HttpMethod.PUT,
                    "/users/change-password"
                ).authenticated()

                // =================================================
                // PUBLIC HOME / TEST
                // =================================================

                .requestMatchers(
                    "/",
                    "/test"
                ).permitAll()

                // =================================================
                // PUBLIC JOB APIs
                // =================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/jobs",
                    "/jobs/*",
                    "/jobs/search",
                    "/jobs/count"
                ).permitAll()

                // =================================================
                // PUBLIC COMPANY VIEW
                // =================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/company/*"
                ).permitAll()

                // =================================================
                // JOB SEEKER - APPLICATIONS
                // =================================================

                .requestMatchers(
                    "/applications/apply/**",
                    "/applications/user/**",
                    "/applications/status/**"
                ).hasRole("JOB_SEEKER")

                // =================================================
                // EMPLOYER - APPLICATIONS
                // =================================================

                .requestMatchers(
                    "/applications/job/**",
                    "/applications/employer/**",
                    "/applications/*/status",
                    "/applications/analytics/**"
                ).hasRole("EMPLOYER")

                // =================================================
                // JOB SEEKER - RESUME
                // =================================================

                .requestMatchers(
                    "/resume/**"
                ).hasRole("JOB_SEEKER")

                // =================================================
                // JOB SEEKER - SAVED JOBS
                // =================================================

                .requestMatchers(
                    "/saved-jobs/**"
                ).hasRole("JOB_SEEKER")

                // =================================================
                // EMPLOYER - JOB MANAGEMENT
                // =================================================

                .requestMatchers(
                    HttpMethod.POST,
                    "/jobs"
                ).hasRole("EMPLOYER")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/jobs/*"
                ).hasRole("EMPLOYER")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/jobs/*"
                ).hasRole("EMPLOYER")

                .requestMatchers(
                    "/jobs/employer/**"
                ).hasRole("EMPLOYER")

                // =================================================
                // JOB SEEKER - INTERVIEWS
                // =================================================

                .requestMatchers(
                    "/interviews/candidate/**",
                    "/interviews/application/**"
                ).hasRole("JOB_SEEKER")

                // =================================================
                // EMPLOYER - SCHEDULE INTERVIEW
                // Matches:
                // POST /interviews/schedule/{applicationId}
                // =================================================

                .requestMatchers(
                    HttpMethod.POST,
                    "/interviews/schedule/**"
                ).hasRole("EMPLOYER")

                // =================================================
                // EMPLOYER - INTERVIEW LIST
                // =================================================

                .requestMatchers(
                    "/interviews/employer/**"
                ).hasRole("EMPLOYER")

                // =================================================
                // EMPLOYER - UPDATE INTERVIEW
                // =================================================

                .requestMatchers(
                    HttpMethod.PUT,
                    "/interviews/*"
                ).hasRole("EMPLOYER")

                // =================================================
                // EMPLOYER - UPDATE STATUS
                // =================================================

                .requestMatchers(
                    HttpMethod.PUT,
                    "/interviews/*/status"
                ).hasRole("EMPLOYER")

                // =================================================
                // EMPLOYER - CANCEL
                // =================================================

                .requestMatchers(
                    HttpMethod.PUT,
                    "/interviews/*/cancel"
                ).hasRole("EMPLOYER")

                // =================================================
                // EMPLOYER - COMPLETE
                // =================================================

                .requestMatchers(
                    HttpMethod.PUT,
                    "/interviews/*/complete"
                ).hasRole("EMPLOYER")

                // =================================================
                // EMPLOYER - DELETE INTERVIEW
                // =================================================

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/interviews/*"
                ).hasRole("EMPLOYER")

                // =================================================
                // GET SINGLE INTERVIEW
                // =================================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/interviews/*"
                ).authenticated()

                // =================================================
                // RECRUITER
                // =================================================

                .requestMatchers(
                    "/recruiter/**"
                ).hasRole("RECRUITER")

                // =================================================
                // EMPLOYER PROFILE
                // =================================================

                .requestMatchers(
                    "/employer/**"
                ).hasRole("EMPLOYER")

                // =================================================
                // COMPANY MANAGEMENT
                // =================================================

                .requestMatchers(
                    HttpMethod.PUT,
                    "/company/**"
                ).hasRole("EMPLOYER")

                // =================================================
                // ANALYTICS
                // =================================================

                .requestMatchers(
                    "/analytics/**"
                ).hasRole("EMPLOYER")

                // =================================================
                // NOTIFICATIONS
                // =================================================

                .requestMatchers(
                    "/notifications/**"
                ).authenticated()

                // =================================================
                // DASHBOARD
                // =================================================

                .requestMatchers(
                    "/dashboard/**"
                ).authenticated()

                // =================================================
                // EMAIL
                // =================================================

                .requestMatchers(
                    "/email/**"
                ).authenticated()

                // =================================================
                // EVERYTHING ELSE
                // =================================================

                .anyRequest().authenticated()
            )

            // =====================================================
            // JWT FILTER
            // =====================================================

            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}