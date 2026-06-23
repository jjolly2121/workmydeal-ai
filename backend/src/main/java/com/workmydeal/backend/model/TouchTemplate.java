package com.workmydeal.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class TouchTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String touchCategory;

    @Column(length = 2000)
    private String exampleMessage;

    private Integer defaultFrequency;

    private Boolean activeStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public TouchTemplate() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

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

    public String getTouchCategory() {
        return touchCategory;
    }

    public void setTouchCategory(String touchCategory) {
        this.touchCategory = touchCategory;
    }

    public String getExampleMessage() {
        return exampleMessage;
    }

    public void setExampleMessage(String exampleMessage) {
        this.exampleMessage = exampleMessage;
    }

    public Integer getDefaultFrequency() {
        return defaultFrequency;
    }

    public void setDefaultFrequency(Integer defaultFrequency) {
        this.defaultFrequency = defaultFrequency;
    }

    public Boolean getActiveStatus() {
        return activeStatus;
    }

    public void setActiveStatus(Boolean activeStatus) {
        this.activeStatus = activeStatus;
    }
}
