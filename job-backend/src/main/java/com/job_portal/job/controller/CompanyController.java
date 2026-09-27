package com.job_portal.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.dto.CompanyProfileDto;
import com.job_portal.job.service.CompanyService;

@RestController
@RequestMapping("/company")
@CrossOrigin(origins = "*")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @GetMapping("/{id}")
    public ResponseEntity<CompanyProfileDto> getCompanyProfile(
            @PathVariable Long id) {

        CompanyProfileDto company =
                companyService.getCompanyProfile(id);

        if (company == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(company);
    }

}