package com.workmydeal.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long dealId;

    private String fieldChanged;

    private String oldValue;

    private String newValue;

    private String changedBy;

    private LocalDateTime changedAt;

    public StatusHistory() {
    }

    public StatusHistory(
            Long dealId,
            String fieldChanged,
            String oldValue,
            String newValue,
            String changedBy
    ) {
        this.dealId = dealId;
        this.fieldChanged = fieldChanged;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.changedBy = changedBy;
        this.changedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getDealId() {
        return dealId;
    }

    public String getFieldChanged() {
        return fieldChanged;
    }

    public String getOldValue() {
        return oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setDealId(Long dealId) {
        this.dealId = dealId;
    }

    public void setFieldChanged(String fieldChanged) {
        this.fieldChanged = fieldChanged;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}