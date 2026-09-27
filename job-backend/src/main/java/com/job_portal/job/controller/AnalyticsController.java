package com.job_portal.job.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.service.AnalyticsService;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // ==========================================
    // EMPLOYER DASHBOARD ANALYTICS
    // ==========================================

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<Map<String, Long>> getEmployerAnalytics(
            @PathVariable Long employerId) {

        long totalJobs =
                analyticsService.getTotalJobs(employerId);

        long totalApplications =
                analyticsService.getTotalApplications(employerId);

        Map<String, Long> analytics =
                new HashMap<>();

        analytics.put("totalJobs", totalJobs);

        analytics.put(
                "totalApplications",
                totalApplications
        );

        return ResponseEntity.ok(analytics);
    }

    // ==========================================
    // APPLICATION COUNT FOR A SPECIFIC JOB
    // ==========================================

    @GetMapping("/job/{jobId}/applications")
    public ResponseEntity<Long> getApplicationsForJob(
            @PathVariable Long jobId) {

        long applicationCount =
                analyticsService.getApplicationsForJob(jobId);

        return ResponseEntity.ok(applicationCount);
    }
}