package com.job_portal.job.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.job.model.User;
import com.job_portal.job.repository.UserRepository;

@Service
public class EmployerProfileService {

    @Autowired
    private UserRepository userRepository;

    // ==========================
    // Get Employer Profile
    // ==========================
    public User getEmployerProfile(Long employerId) {

        return userRepository.findById(employerId)
                .orElse(null);

    }

    // ==========================
    // Update Employer Profile
    // ==========================
    public User updateEmployerProfile(Long employerId, User updatedUser) {

        User employer = userRepository.findById(employerId)
                .orElse(null);

        if (employer == null) {
            return null;
        }

        employer.setName(updatedUser.getName());
        employer.setCompanyDescription(updatedUser.getCompanyDescription());
        employer.setCompanyWebsite(updatedUser.getCompanyWebsite());
        employer.setCompanyLogo(updatedUser.getCompanyLogo());
        employer.setCompanyAddress(updatedUser.getCompanyAddress());
        employer.setContactNumber(updatedUser.getContactNumber());

        return userRepository.save(employer);
    }
}