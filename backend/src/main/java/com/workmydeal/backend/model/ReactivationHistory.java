package com.workmydeal.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class ReactivationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long dealId;

    private String triggerType;

    @Column(length = 1000)
    private String reason;

    private String reactivatedBy;

    private LocalDateTime reactivatedAt;

    public ReactivationHistory() {
    }

    public ReactivationHistory(
            Long dealId,
            String triggerType,
            String reason,
            String reactivatedBy
    ) {
        this.dealId = dealId;
        this.triggerType = triggerType;
        this.reason = reason;
        this.reactivatedBy = reactivatedBy;
        this.reactivatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getDealId() {
        return dealId;
    }

    public void setDealId(Long dealId) {
        this.dealId = dealId;
    }

    public String getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(String triggerType) {
        this.triggerType = triggerType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getReactivatedBy() {
        return reactivatedBy;
    }

    public void setReactivatedBy(String reactivatedBy) {
        this.reactivatedBy = reactivatedBy;
    }

    public LocalDateTime getReactivatedAt() {
        return reactivatedAt;
    }
}
