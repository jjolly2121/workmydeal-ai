package com.workmydeal.backend.dto;

public class PriorityRecommendation {

    private Integer priorityScore;
    private String priorityLevel;
    private String reason;

    public PriorityRecommendation() {
    }

    public PriorityRecommendation(
            Integer priorityScore,
            String priorityLevel,
            String reason
    ) {
        this.priorityScore = priorityScore;
        this.priorityLevel = priorityLevel;
        this.reason = reason;
    }

    public Integer getPriorityScore() {
        return priorityScore;
    }

    public void setPriorityScore(Integer priorityScore) {
        this.priorityScore = priorityScore;
    }

    public String getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(String priorityLevel) {
        this.priorityLevel = priorityLevel;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}