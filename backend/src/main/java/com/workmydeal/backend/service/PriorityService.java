package com.workmydeal.backend.service;

import com.workmydeal.backend.dto.PriorityRecommendation;
import com.workmydeal.backend.model.Deal;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class PriorityService {

    public PriorityRecommendation calculatePriority(Deal deal) {
        int score = 0;
        StringBuilder reason = new StringBuilder();

        if (deal.getDealValue() != null) {
            int valuePoints = calculateDealValuePoints(deal.getDealValue());

            score += valuePoints;
            reason.append("Deal value contributes ")
                    .append(valuePoints)
                    .append(" points. ");
        }

        // Probability is weighted into the score because it represents close likelihood.
        if (deal.getProbability() != null) {
            int probabilityPoints = Math.min(20, Math.max(0, deal.getProbability() / 5));

            score += probabilityPoints;

            reason.append("Probability contributes ")
                    .append(probabilityPoints)
                    .append(" points. ");
        }

        // Later-stage deals receive additional urgency in the execution queue.
        if (deal.getStage() != null) {
            String stage = deal.getStage().toUpperCase();

            if (stage.contains("NEGOTIATION")) {
                score += 20;
                reason.append("Negotiation stage +20. ");
            } else if (stage.contains("PROPOSAL")) {
                score += 15;
                reason.append("Proposal stage +15. ");
            } else if (stage.contains("QUALIFIED")) {
                score += 10;
                reason.append("Qualified stage +10. ");
            }
        }

        // Older touchpoints increase the priority so stale deals resurface.
        if (deal.getLastContactDate() != null) {
            long daysSinceTouch = ChronoUnit.DAYS.between(
                    deal.getLastContactDate(),
                    LocalDate.now()
            );

            if (daysSinceTouch >= 14) {
                score += 20;
                reason.append("Overdue touch +20. ");
            } else if (daysSinceTouch >= 7) {
                score += 10;
                reason.append("Aging follow-up +10. ");
            }
        }

        // Follow-up dates give the score a time-based urgency signal.
        if (deal.getNextFollowUpDate() != null) {
            LocalDate today = LocalDate.now();

            if (deal.getNextFollowUpDate().isBefore(today)) {
                score += 20;
                reason.append("Overdue follow-up date +20. ");

                if (
                        deal.getStage() != null
                                &&
                                deal.getStage().toUpperCase().contains("PROPOSAL")
                ) {
                    score += 10;
                    reason.append("Proposal is overdue +10. ");
                }
            } else if (deal.getNextFollowUpDate().isEqual(today)) {
                score += 10;
                reason.append("Follow-up due today +10. ");
            }
        }

        score = Math.min(score, 100);

        String priorityLevel;

        if (score >= 90) {
            priorityLevel = "VERY_HIGH";
        } else if (score >= 70) {
            priorityLevel = "HIGH";
        } else if (score >= 40) {
            priorityLevel = "MEDIUM";
        } else {
            priorityLevel = "LOW";
        }

        return new PriorityRecommendation(
                score,
                priorityLevel,
                reason.toString()
        );
    }

    private int calculateDealValuePoints(BigDecimal dealValue) {
        if (dealValue.compareTo(BigDecimal.valueOf(1000000)) >= 0) {
            return 20;
        }

        if (dealValue.compareTo(BigDecimal.valueOf(500000)) >= 0) {
            return 15;
        }

        if (dealValue.compareTo(BigDecimal.valueOf(100000)) >= 0) {
            return 10;
        }

        if (dealValue.compareTo(BigDecimal.ZERO) > 0) {
            return 5;
        }

        return 0;
    }
}
