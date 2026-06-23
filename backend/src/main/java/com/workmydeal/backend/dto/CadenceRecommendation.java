package com.workmydeal.backend.dto;

public class CadenceRecommendation {

    private String cadenceLevel;
    private Integer recommendedDaysBetweenTouches;
    private String reason;

    public CadenceRecommendation() {
    }

    public CadenceRecommendation(String cadenceLevel, Integer recommendedDaysBetweenTouches, String reason) {
        this.cadenceLevel = cadenceLevel;
        this.recommendedDaysBetweenTouches = recommendedDaysBetweenTouches;
        this.reason = reason;
    }

    public String getCadenceLevel() {
        return cadenceLevel;
    }

    public void setCadenceLevel(String cadenceLevel) {
        this.cadenceLevel = cadenceLevel;
    }

    public Integer getRecommendedDaysBetweenTouches() {
        return recommendedDaysBetweenTouches;
    }

    public void setRecommendedDaysBetweenTouches(Integer recommendedDaysBetweenTouches) {
        this.recommendedDaysBetweenTouches = recommendedDaysBetweenTouches;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}