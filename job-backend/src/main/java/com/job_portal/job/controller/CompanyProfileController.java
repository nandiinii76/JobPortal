package com.job_portal.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.dto.CompanyProfileResponse;
import com.job_portal.job.service.CompanyProfileService;

@RestController
@RequestMapping("/company-profile")
@CrossOrigin(origins = "*")
public class CompanyProfileController {

    @Autowired
    private CompanyProfileService companyProfileService;

    @GetMapping("/{id}")
    public ResponseEntity<CompanyProfileResponse> getCompany(
            @PathVariable Long id) {

        CompanyProfileResponse response =
                companyProfileService.getCompany(id);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }
}