package com.job_portal.job.model;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "interviews")
public class Interview {

    // ==========================================
    // ID
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // APPLICATION
    // One interview per application
    // ==========================================

    @OneToOne
    @JoinColumn(
            name = "application_id",
            nullable = false,
            unique = true
    )
    @JsonIgnoreProperties({
            "interview",
            "hibernateLazyInitializer",
            "handler"
    })
    private Application application;

    // ==========================================
    // INTERVIEW DATE
    // ==========================================

    @Column(nullable = false)
    private LocalDate interviewDate;

    // ==========================================
    // INTERVIEW TIME
    // ==========================================

    @Column(nullable = false)
    private LocalTime interviewTime;

    // ==========================================
    // INTERVIEW MODE
    // ONLINE / OFFLINE
    // ==========================================

    @Column(nullable = false)
    private String interviewMode;

    // ==========================================
    // ONLINE INTERVIEW
    // ==========================================

    private String meetingLink;

    // ==========================================
    // OFFLINE INTERVIEW
    // ==========================================

    private String location;

    // ==========================================
    // INTERVIEWER DETAILS
    // ==========================================
    @Column(nullable = false)
    private String interviewerName;

    private String interviewerEmail;

    // ==========================================
    // NOTES
    // ==========================================

    @Column(length = 1000)
    private String notes;

    // ==========================================
    // STATUS
    // SCHEDULED
    // COMPLETED
    // CANCELLED
    // ==========================================

    @Column(nullable = false)
    private String status;

    // ==========================================
    // CONSTRUCTOR
    // ==========================================

    public Interview() {
    }

    // ==========================================
    // GETTERS AND SETTERS
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public LocalDate getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(LocalDate interviewDate) {
        this.interviewDate = interviewDate;
    }

    public LocalTime getInterviewTime() {
        return interviewTime;
    }

    public void setInterviewTime(LocalTime interviewTime) {
        this.interviewTime = interviewTime;
    }

    public String getInterviewMode() {
        return interviewMode;
    }

    public void setInterviewMode(String interviewMode) {
        this.interviewMode = interviewMode;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getInterviewerName() {
        return interviewerName;
    }

    public void setInterviewerName(String interviewerName) {
        this.interviewerName = interviewerName;
    }

    public String getInterviewerEmail() {
        return interviewerEmail;
    }

    public void setInterviewerEmail(String interviewerEmail) {
        this.interviewerEmail = interviewerEmail;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}