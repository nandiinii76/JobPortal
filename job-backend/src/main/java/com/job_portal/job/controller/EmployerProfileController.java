package com.job_portal.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.model.User;
import com.job_portal.job.service.EmployerProfileService;

@RestController
@RequestMapping("/employer")
@CrossOrigin(origins = "*")
public class EmployerProfileController {

    @Autowired
    private EmployerProfileService employerProfileService;

    // ==========================================
    // Get Employer Profile
    // GET /employer/{id}
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployerProfile(@PathVariable Long id) {

        User employer = employerProfileService.getEmployerProfile(id);

        if (employer == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Employer not found.");
        }

        return ResponseEntity.ok(employer);
    }

    // ==========================================
    // Update Employer Profile
    // PUT /employer/{id}
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployerProfile(
            @PathVariable Long id,
            @RequestBody User user) {

        User updatedEmployer =
                employerProfileService.updateEmployerProfile(id, user);

        if (updatedEmployer == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Employer not found.");
        }

        return ResponseEntity.ok(updatedEmployer);
    }

}