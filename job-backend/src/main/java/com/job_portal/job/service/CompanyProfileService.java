package com.job_portal.job.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.job.dto.CompanyProfileResponse;
import com.job_portal.job.model.Job;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.UserRepository;

@Service
public class CompanyProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    public CompanyProfileResponse getCompany(Long employerId) {

        User employer = userRepository.findById(employerId).orElse(null);

        if (employer == null) {
            return null;
        }

        List<Job> jobs = jobRepository.findByEmployerId(employerId);

        CompanyProfileResponse response = new CompanyProfileResponse();

        response.setEmployerId(employer.getId());
        response.setCompanyName(employer.getName());
        response.setCompanyDescription(employer.getCompanyDescription());
        response.setCompanyWebsite(employer.getCompanyWebsite());
        response.setCompanyLogo(employer.getCompanyLogo());
        response.setCompanyAddress(employer.getCompanyAddress());
        response.setContactNumber(employer.getContactNumber());

        response.setJobs(jobs);

        return response;
    }

}