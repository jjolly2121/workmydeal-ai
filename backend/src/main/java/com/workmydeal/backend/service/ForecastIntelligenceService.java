package com.workmydeal.backend.service;

import com.workmydeal.backend.dto.ForecastInsight;
import com.workmydeal.backend.model.Deal;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class ForecastIntelligenceService {

    public ForecastInsight buildForecastInsight(Deal deal) {
        LocalDate predictedCloseDate = predictCloseDate(deal);
        String forecastBucket = determineBucket(predictedCloseDate);
        String confidence = determineConfidence(deal);
        String risk = determineRisk(deal);
        String reason = buildReason(deal);

        return new ForecastInsight(
                deal.getId(),
                deal.getDealName(),
                predictedCloseDate,
                forecastBucket,
                confidence,
                risk,
                reason
        );
    }

    // Predict a close date when the deal does not yet have one entered.
    private LocalDate predictCloseDate(Deal deal) {
        if (deal.getExpectedCloseDate() != null) {
            return deal.getExpectedCloseDate();
        }

        LocalDate today = LocalDate.now();
        String stage = deal.getStage() == null ? "" : deal.getStage().toUpperCase();

        if (stage.contains("NEGOTIATION")) {
            return today.plusDays(14);
        }

        if (stage.contains("PROPOSAL")) {
            return today.plusDays(30);
        }

        if (stage.contains("DISCOVERY")) {
            return today.plusDays(45);
        }

        if (stage.contains("QUALIFIED")) {
            return today.plusDays(60);
        }

        return today.plusDays(90);
    }

    // Buckets group opportunities into the forecast windows shown in the UI.
    private String determineBucket(LocalDate closeDate) {
        long days = LocalDate.now()
                .until(closeDate)
                .getDays();

        if (days <= 30) {
            return "MONTH_1";
        }

        if (days <= 60) {
            return "MONTH_2";
        }

        if (days <= 90) {
            return "MONTH_3";
        }

        return "OUTSIDE_FORECAST";
    }

    private String determineConfidence(Deal deal) {
        Integer probability = deal.getProbability();

        if (probability == null) {
            return "LOW";
        }

        if (probability >= 75) {
            return "HIGH";
        }

        if (probability >= 50) {
            return "MEDIUM";
        }

        return "LOW";
    }

    // Risk flags combine overdue follow-up and low probability indicators.
    private String determineRisk(Deal deal) {
        if (
                deal.getNextFollowUpDate() != null &&
                deal.getNextFollowUpDate().isBefore(LocalDate.now())
        ) {
            return "AT_RISK";
        }

        if (
                deal.getProbability() != null &&
                deal.getProbability() < 40
        ) {
            return "WATCH";
        }

        return "STABLE";
    }

    private String buildReason(Deal deal) {
        return "Forecast based on stage, probability, and follow-up status.";
    }
}
