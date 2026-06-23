package com.workmydeal.backend.dto;

import java.time.LocalDate;

public class ForecastInsight {

    private Long dealId;
    private String dealName;
    private LocalDate predictedCloseDate;
    private String forecastBucket;
    private String confidenceLevel;
    private String forecastRisk;
    private String reason;

    public ForecastInsight() {
    }

    public ForecastInsight(
            Long dealId,
            String dealName,
            LocalDate predictedCloseDate,
            String forecastBucket,
            String confidenceLevel,
            String forecastRisk,
            String reason
    ) {
        this.dealId = dealId;
        this.dealName = dealName;
        this.predictedCloseDate = predictedCloseDate;
        this.forecastBucket = forecastBucket;
        this.confidenceLevel = confidenceLevel;
        this.forecastRisk = forecastRisk;
        this.reason = reason;
    }

    public Long getDealId() {
        return dealId;
    }

    public String getDealName() {
        return dealName;
    }

    public LocalDate getPredictedCloseDate() {
        return predictedCloseDate;
    }

    public String getForecastBucket() {
        return forecastBucket;
    }

    public String getConfidenceLevel() {
        return confidenceLevel;
    }

    public String getForecastRisk() {
        return forecastRisk;
    }

    public String getReason() {
        return reason;
    }
}