package com.job_portal.job.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.job_portal.job.model.Resume;
import com.job_portal.job.service.ResumeService;

@RestController
@RequestMapping("/resume")
@CrossOrigin(origins = "http://localhost:3000")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    // ==========================================
    // SAVE RESUME PROFILE INFORMATION
    // ==========================================

    @PostMapping
    public ResponseEntity<?> saveProfile(
            @RequestParam Long userId,
            @RequestBody Resume resume
    ) {

        try {

            Resume savedResume =
                    resumeService.saveProfile(
                            userId,
                            resume
                    );

            return ResponseEntity.ok(savedResume);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // UPLOAD RESUME PDF
    // ==========================================

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long userId
    ) {

        try {

            Resume savedResume =
                    resumeService.uploadResume(
                            userId,
                            file
                    );

            return ResponseEntity.ok(savedResume);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to upload resume");
        }
    }

    // ==========================================
    // GET RESUME
    // ==========================================

    @GetMapping("/{userId}")
    public ResponseEntity<?> getResume(
            @PathVariable Long userId
    ) {

        try {

            Resume resume =
                    resumeService.getResume(userId);

            if (resume == null) {

                return ResponseEntity
                        .notFound()
                        .build();
            }

            return ResponseEntity.ok(resume);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // DOWNLOAD RESUME
    // ==========================================

    @GetMapping("/download/{resumeId}")
    public ResponseEntity<?> downloadResume(
            @PathVariable Long resumeId,
            @RequestParam Long userId
    ) {

        try {

            byte[] fileBytes =
                    resumeService.downloadResume(
                            resumeId,
                            userId
                    );

            ByteArrayResource resource =
                    new ByteArrayResource(fileBytes);

            HttpHeaders headers =
                    new HttpHeaders();

            headers.setContentType(
                    MediaType.APPLICATION_PDF
            );

            headers.setContentDisposition(
                    ContentDisposition
                            .attachment()
                            .filename("resume.pdf")
                            .build()
            );

            headers.setContentLength(
                    fileBytes.length
            );

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (IOException e) {

            return ResponseEntity
                    .notFound()
                    .build();

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to download resume");
        }
    }

    // ==========================================
    // RESUME COUNT
    // ==========================================

    @GetMapping("/count")
    public ResponseEntity<Long> getResumeCount() {

        return ResponseEntity.ok(
                resumeService.getResumeCount()
        );
    }

    // ==========================================
    // DELETE RESUME
    // ==========================================

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteResume(
            @PathVariable Long userId
    ) {

        try {

            resumeService.deleteResume(userId);

            return ResponseEntity.ok(
                    "Resume deleted successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ==========================================
    // TEST ENDPOINT
    // ==========================================

    @GetMapping("/test")
    public ResponseEntity<String> test() {

        return ResponseEntity.ok(
                "Resume Controller Working"
        );
    }
}