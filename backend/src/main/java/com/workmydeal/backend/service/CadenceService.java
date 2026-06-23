package com.workmydeal.backend.service;

import com.workmydeal.backend.dto.CadenceRecommendation;
import com.workmydeal.backend.model.Cadence;
import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.repository.CadenceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class CadenceService {

    private final CadenceRepository cadenceRepository;

    public CadenceService(CadenceRepository cadenceRepository) {
        this.cadenceRepository = cadenceRepository;
    }

    public List<Cadence> getAllCadences() {
        return cadenceRepository.findAll();
    }

    public Cadence createCadence(Cadence cadence) {
        return cadenceRepository.save(cadence);
    }

    public Cadence updateCadence(Long id, Cadence updatedCadence) {
        Cadence existingCadence = cadenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cadence not found with id: " + id));

        existingCadence.setCadenceType(updatedCadence.getCadenceType());
        existingCadence.setFrequencyDays(updatedCadence.getFrequencyDays());
        existingCadence.setNextTouchDate(updatedCadence.getNextTouchDate());
        existingCadence.setTouchCategory(updatedCadence.getTouchCategory());
        existingCadence.setRequiredFlag(updatedCadence.getRequiredFlag());
        existingCadence.setActiveStatus(updatedCadence.getActiveStatus());

        return cadenceRepository.save(existingCadence);
    }

    public CadenceRecommendation recommendCadence(Deal deal) {
        // Closed or archived deals should not appear in active execution work.
        if (
                "CLOSED_WON".equalsIgnoreCase(deal.getDealStatus())
                        || "CLOSED_WON".equalsIgnoreCase(deal.getStage())
        ) {
            return new CadenceRecommendation(
                    "NONE",
                    null,
                    "Deal is closed won and removed from active execution."
            );
        }

        if ("ARCHIVED".equalsIgnoreCase(deal.getDealStatus())) {
            return new CadenceRecommendation(
                    "NONE",
                    null,
                    "Deal is archived and removed from active execution."
            );
        }

        if ("DORMANT".equalsIgnoreCase(deal.getDealStatus())) {
            return new CadenceRecommendation(
                    "LOW",
                    90,
                    "Opportunity is dormant, so the goal is light relationship maintenance."
            );
        }

        CadenceRecommendation contractCadence = evaluateContractTiming(deal);

        // Contract timing takes priority over normal sales-stage cadence.
        if (contractCadence != null) {
            return contractCadence;
        }

        String stage = deal.getStage() == null ? "" : deal.getStage().toUpperCase();

        if (stage.contains("VERBAL") || stage.contains("NEGOTIATION")) {
            return new CadenceRecommendation(
                    "VERY_HIGH",
                    2,
                    "Deal is in a late-stage buying conversation and should be touched frequently."
            );
        }

        if (stage.contains("PROPOSAL")) {
            return new CadenceRecommendation(
                    "HIGH",
                    3,
                    "Proposal-stage opportunities need close follow-up to maintain momentum."
            );
        }

        if (stage.contains("QUALIFIED") || stage.contains("DISCOVERY")) {
            return new CadenceRecommendation(
                    "MEDIUM",
                    7,
                    "Qualified opportunities should be touched weekly to keep the deal moving."
            );
        }

        if (stage.contains("NEW_LEAD")) {
            return new CadenceRecommendation(
                    "MEDIUM",
                    3,
                    "New leads should be contacted quickly before momentum is lost."
            );
        }

        return new CadenceRecommendation(
                "MEDIUM",
                14,
                "Default cadence applied because no stronger timing rule matched."
        );
    }

    private CadenceRecommendation evaluateContractTiming(Deal deal) {
        // Renewal cadences only apply to deals with active contract dates.
        if (deal.getContractEndDate() == null) {
            return null;
        }

        if (!"IN_CONTRACT".equalsIgnoreCase(deal.getContractStatus())) {
            return null;
        }

        LocalDate today = LocalDate.now();

        long daysUntilContractEnd = ChronoUnit.DAYS.between(
                today,
                deal.getContractEndDate()
        );

        int noticeStart =
                deal.getNoticeWindowStartDays() == null
                        ? 120
                        : deal.getNoticeWindowStartDays();

        int noticeEnd =
                deal.getNoticeWindowEndDays() == null
                        ? 90
                        : deal.getNoticeWindowEndDays();

        if (daysUntilContractEnd < 0) {
            return new CadenceRecommendation(
                    "LOW",
                    90,
                    "Contract date has passed, so the opportunity should move into dormant nurture unless reactivated."
            );
        }

        if (daysUntilContractEnd <= 89) {
            return new CadenceRecommendation(
                    "LOW",
                    90,
                    "The opportunity appears to have passed the safe notice window and should return to dormant nurture."
            );
        }

        if (
                daysUntilContractEnd <= noticeStart &&
                daysUntilContractEnd >= noticeEnd
        ) {
            return new CadenceRecommendation(
                    "VERY_HIGH",
                    7,
                    "The opportunity is inside the contract notice window and should be prioritized before auto-renewal risk."
            );
        }

        if (daysUntilContractEnd <= 180 && daysUntilContractEnd > noticeStart) {
            return new CadenceRecommendation(
                    "MEDIUM",
                    30,
                    "The opportunity is approaching the notice window, so monthly warm-up touches should begin."
            );
        }

        return new CadenceRecommendation(
                "LOW",
                90,
                "The opportunity is under contract and outside the active renewal window, so light nurture is recommended."
        );
    }
}
