package com.workmydeal.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Cadence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cadenceType;

    private Integer frequencyDays;

    private LocalDate nextTouchDate;

    private String touchCategory;

    private Boolean requiredFlag;

    private Boolean activeStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Cadence() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.requiredFlag == null) {
            this.requiredFlag = false;
        }

        if (this.activeStatus == null) {
            this.activeStatus = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getCadenceType() {
        return cadenceType;
    }

    public void setCadenceType(String cadenceType) {
        this.cadenceType = cadenceType;
    }

    public Integer getFrequencyDays() {
        return frequencyDays;
    }

    public void setFrequencyDays(Integer frequencyDays) {
        this.frequencyDays = frequencyDays;
    }

    public LocalDate getNextTouchDate() {
        return nextTouchDate;
    }

    public void setNextTouchDate(LocalDate nextTouchDate) {
        this.nextTouchDate = nextTouchDate;
    }

    public String getTouchCategory() {
        return touchCategory;
    }

    public void setTouchCategory(String touchCategory) {
        this.touchCategory = touchCategory;
    }

    public Boolean getRequiredFlag() {
        return requiredFlag;
    }

    public void setRequiredFlag(Boolean requiredFlag) {
        this.requiredFlag = requiredFlag;
    }

    public Boolean getActiveStatus() {
        return activeStatus;
    }

    public void setActiveStatus(Boolean activeStatus) {
        this.activeStatus = activeStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}