package com.job_portal.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.job_portal.job.dto.EmailRequest;
import com.job_portal.job.service.EmailService;

@RestController
@RequestMapping("/email")
@CrossOrigin(origins = "*")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request) {

        try {
            emailService.sendEmail(
                    request.getTo(),
                    request.getSubject(),
                    request.getBody()
            );

            return ResponseEntity.ok("Email sent successfully!");

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Failed to send email: " + e.getMessage());
        }
    }
}