package com.job_portal.job.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController{

    @GetMapping("/")
    public String home() {
        return "*WELCOME TO JOB PORTAL*";
    }
}