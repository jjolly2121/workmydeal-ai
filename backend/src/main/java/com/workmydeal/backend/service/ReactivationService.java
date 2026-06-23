package com.workmydeal.backend.service;

import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.model.ReactivationHistory;
import com.workmydeal.backend.repository.DealRepository;
import com.workmydeal.backend.repository.ReactivationHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReactivationService {

    private final DealRepository dealRepository;
    private final ReactivationHistoryRepository reactivationHistoryRepository;
    private final AuditHistoryService auditHistoryService;

    public ReactivationService(
            DealRepository dealRepository,
            ReactivationHistoryRepository reactivationHistoryRepository,
            AuditHistoryService auditHistoryService
    ) {
        this.dealRepository = dealRepository;
        this.reactivationHistoryRepository = reactivationHistoryRepository;
        this.auditHistoryService = auditHistoryService;
    }

    public Deal reactivateDeal(Long dealId, String reactivatedBy, String reason) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with id: " + dealId));

        deal.setDealStatus("ACTIVE");
        deal.setContractStatus("MONTH_TO_MONTH");

        Deal savedDeal = dealRepository.save(deal);

        ReactivationHistory event = new ReactivationHistory(
                dealId,
                "MANUAL",
                reason == null || reason.isBlank() ? "Manual reactivation" : reason,
                reactivatedBy
        );

        reactivationHistoryRepository.save(event);

        auditHistoryService.record(
                "REACTIVATE",
                "DEAL",
                dealId,
                reactivatedBy,
                event.getReason()
        );

        return savedDeal;
    }

    public List<ReactivationHistory> getReactivationHistory(Long dealId) {
        return reactivationHistoryRepository.findByDealIdOrderByReactivatedAtDesc(dealId);
    }
}
