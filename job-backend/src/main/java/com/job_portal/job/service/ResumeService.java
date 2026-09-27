package com.job_portal.job.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.job_portal.job.exception.UserNotFoundException;
import com.job_portal.job.model.Resume;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.ResumeRepository;
import com.job_portal.job.repository.UserRepository;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${file.upload-dir:uploads/resumes}")
    private String uploadDir;


    // =========================================================
    // SAVE / UPDATE RESUME PROFILE
    // =========================================================

    public Resume saveProfile(Long userId, Resume resume) {

        if (userId == null) {
            throw new RuntimeException("User ID is required");
        }

        if (resume == null) {
            throw new RuntimeException("Resume details are required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with ID: " + userId
                        )
                );


        Resume savedResume = resumeRepository
                .findByUserId(userId)
                .orElse(new Resume());


        savedResume.setUser(user);

        savedResume.setSkills(
                resume.getSkills()
        );

        savedResume.setEducation(
                resume.getEducation()
        );

        savedResume.setExperience(
                resume.getExperience()
        );

        savedResume.setPhone(
                resume.getPhone()
        );

        savedResume.setLinkedin(
                resume.getLinkedin()
        );

        savedResume.setGithub(
                resume.getGithub()
        );


        return resumeRepository.save(savedResume);
    }


    // =========================================================
    // UPLOAD RESUME PDF
    // =========================================================

    public Resume uploadResume(
            Long userId,
            MultipartFile file) {

        if (userId == null) {
            throw new RuntimeException("User ID is required");
        }


        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with ID: " + userId
                        )
                );


        // -----------------------------------------------------
        // File validation
        // -----------------------------------------------------

        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "Resume file is required"
            );
        }


        if (!"application/pdf".equalsIgnoreCase(
                file.getContentType())) {

            throw new RuntimeException(
                    "Only PDF files are allowed"
            );
        }


        // Maximum 5 MB

        if (file.getSize() > 5 * 1024 * 1024) {

            throw new RuntimeException(
                    "Resume size must not exceed 5 MB"
            );
        }


        // -----------------------------------------------------
        // Create upload directory
        // -----------------------------------------------------

        try {

            Path uploadPath =
                    Paths.get(uploadDir)
                            .toAbsolutePath()
                            .normalize();


            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }


            // -------------------------------------------------
            // Generate safe unique filename
            // -------------------------------------------------

            String originalFileName =
                    file.getOriginalFilename();


            String extension = ".pdf";

            if (originalFileName != null &&
                    originalFileName
                            .toLowerCase()
                            .endsWith(".pdf")) {

                extension = ".pdf";
            }


            String safeFileName =
                    UUID.randomUUID() + extension;


            Path filePath =
                    uploadPath.resolve(safeFileName)
                              .normalize();


            // Prevent path traversal

            if (!filePath.startsWith(uploadPath)) {

                throw new RuntimeException(
                        "Invalid resume file path"
                );
            }


            // -------------------------------------------------
            // Find existing resume
            // -------------------------------------------------

            Resume resume =
                    resumeRepository
                            .findByUserId(userId)
                            .orElse(new Resume());


            String oldResumePath =
                    resume.getResumeUrl();


            resume.setUser(user);


            // -------------------------------------------------
            // Save new file
            // -------------------------------------------------

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );


            resume.setResumeUrl(
                    filePath.toString()
            );


            Resume savedResume =
                    resumeRepository.save(resume);


            // -------------------------------------------------
            // Delete old PDF after successful save
            // -------------------------------------------------

            if (oldResumePath != null &&
                    !oldResumePath.equals(
                            filePath.toString())) {

                try {

                    Files.deleteIfExists(
                            Paths.get(oldResumePath)
                    );

                } catch (IOException ignored) {

                    // Database and new file are already updated.
                    // Old file cleanup failure should not
                    // invalidate the successful upload.
                }
            }


            return savedResume;


        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to upload resume",
                    e
            );
        }
    }


    // =========================================================
    // SAVE RESUME FILENAME / URL
    // =========================================================

    public Resume saveResume(
            Long userId,
            String fileName) {

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }


        if (fileName == null ||
                fileName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Resume file name is required"
            );
        }


        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with ID: " + userId
                        )
                );


        Resume resume =
                resumeRepository
                        .findByUserId(userId)
                        .orElse(new Resume());


        resume.setUser(user);

        resume.setResumeUrl(
                fileName.trim()
        );


        return resumeRepository.save(resume);
    }


    // =========================================================
    // GET RESUME
    // =========================================================

    public Resume getResume(Long userId) {

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }


        return resumeRepository
                .findByUserId(userId)
                .orElse(null);
    }


    // =========================================================
    // DOWNLOAD RESUME
    // =========================================================

    public byte[] downloadResume(
            Long resumeId,
            Long userId) {

        if (resumeId == null) {
            throw new RuntimeException(
                    "Resume ID is required"
            );
        }

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }


        Resume resume =
                resumeRepository
                        .findById(resumeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Resume not found"
                                )
                        );


        // -----------------------------------------------------
        // Security check
        // -----------------------------------------------------

        if (resume.getUser() == null ||
                resume.getUser().getId() == null ||
                !resume.getUser()
                        .getId()
                        .equals(userId)) {

            throw new RuntimeException(
                    "You are not authorized to access this resume"
            );
        }


        if (resume.getResumeUrl() == null ||
                resume.getResumeUrl()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Resume file not found"
            );
        }


        try {

            Path path =
                    Paths.get(
                            resume.getResumeUrl()
                    )
                    .toAbsolutePath()
                    .normalize();


            if (!Files.exists(path)) {

                throw new RuntimeException(
                        "Resume file not found"
                );
            }


            return Files.readAllBytes(path);


        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to download resume",
                    e
            );
        }
    }


    // =========================================================
    // RESUME COUNT
    // =========================================================

    public Long getResumeCount() {

        return resumeRepository.count();
    }


    // =========================================================
    // DELETE RESUME
    // =========================================================

    public void deleteResume(Long userId) {

        if (userId == null) {
            throw new RuntimeException(
                    "User ID is required"
            );
        }


        Resume resume =
                resumeRepository
                        .findByUserId(userId)
                        .orElse(null);


        if (resume == null) {
            return;
        }


        // -----------------------------------------------------
        // Delete physical file
        // -----------------------------------------------------

        if (resume.getResumeUrl() != null &&
                !resume.getResumeUrl()
                        .trim()
                        .isEmpty()) {

            try {

                Path path =
                        Paths.get(
                                resume.getResumeUrl()
                        );

                Files.deleteIfExists(path);

            } catch (IOException e) {

                throw new RuntimeException(
                        "Failed to delete resume file",
                        e
                );
            }
        }


        // -----------------------------------------------------
        // Delete database record
        // -----------------------------------------------------

        resumeRepository.delete(resume);
    }
}