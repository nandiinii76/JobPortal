package com.job_portal.job.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.job_portal.job.dto.CompanyProfileDto;
import com.job_portal.job.dto.JobDto;
import com.job_portal.job.model.Job;
import com.job_portal.job.model.User;
import com.job_portal.job.repository.JobRepository;
import com.job_portal.job.repository.UserRepository;

@Service
public class CompanyService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    public CompanyProfileDto getCompanyProfile(Long employerId) {

        User employer = userRepository.findById(employerId).orElse(null);

        if (employer == null) {
            return null;
        }

        List<Job> jobs = jobRepository.findAll();

        List<JobDto> jobDtos = new ArrayList<>();

        for (Job job : jobs) {

            if (job.getEmployer() != null &&
                job.getEmployer().getId().equals(employerId)) {

                JobDto dto = new JobDto();

                dto.setId(job.getId());
                dto.setTitle(job.getTitle());
                dto.setLocation(job.getLocation());
                dto.setSalary(job.getSalary());

                jobDtos.add(dto);
            }
        }

        CompanyProfileDto company = new CompanyProfileDto();

        company.setId(employer.getId());
        company.setCompanyName(employer.getName());
        company.setCompanyDescription(employer.getCompanyDescription());
        company.setCompanyWebsite(employer.getCompanyWebsite());
        company.setCompanyLogo(employer.getCompanyLogo());
        company.setCompanyAddress(employer.getCompanyAddress());
        company.setContactNumber(employer.getContactNumber());

        company.setJobs(jobDtos);

        return company;
    }

}