package com.workmydeal.backend.dto;

import java.time.LocalDate;

public class ExecutionRecommendation {

    private Long dealId;

    private String dealName;

    private Integer priorityScore;

    private String cadenceLevel;

    private Boolean needsAttention;

    private Boolean overdue;

    private Boolean completed;

    private String reason;

    private LocalDate lastContactDate;

    private LocalDate nextFollowUpDate;

    public ExecutionRecommendation() {
    }

    public ExecutionRecommendation(
            Long dealId,
            String dealName,
            Integer priorityScore,
            String cadenceLevel,
            Boolean needsAttention,
            Boolean overdue,
            Boolean completed,
            String reason,
            LocalDate lastContactDate,
            LocalDate nextFollowUpDate
    ) {

        this.dealId = dealId;

        this.dealName = dealName;

        this.priorityScore = priorityScore;

        this.cadenceLevel = cadenceLevel;

        this.needsAttention = needsAttention;

        this.overdue = overdue;

        this.completed = completed;

        this.reason = reason;

        this.lastContactDate = lastContactDate;

        this.nextFollowUpDate = nextFollowUpDate;
    }

    public Long getDealId() {
        return dealId;
    }

    public String getDealName() {
        return dealName;
    }

    public Integer getPriorityScore() {
        return priorityScore;
    }

    public String getCadenceLevel() {
        return cadenceLevel;
    }

    public Boolean getNeedsAttention() {
        return needsAttention;
    }

    public Boolean getOverdue() {
        return overdue;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public String getReason() {
        return reason;
    }

    public LocalDate getLastContactDate() {
        return lastContactDate;
    }

    public LocalDate getNextFollowUpDate() {
        return nextFollowUpDate;
    }
}