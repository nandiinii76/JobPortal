package com.job_portal.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.dto.DashboardStats;
import com.job_portal.job.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // ==========================
    // Dashboard Statistics
    // ==========================
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {

        DashboardStats stats = dashboardService.getDashboardStats();

        return ResponseEntity.ok(stats);
    }

    // ==========================
    // Test API
    // ==========================
    @GetMapping("/test")
    public String test() {
        return "Dashboard Controller Working";
    }

}