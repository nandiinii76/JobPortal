package com.job_portal.job.dto;

public class JobDto {

    private Long id;

    private String title;

    private String location;

    private Double salary;

    public JobDto() {
    }

    public JobDto(Long id,
                  String title,
                  String location,
                  Double salary) {

        this.id = id;
        this.title = title;
        this.location = location;
        this.salary = salary;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }
}