package com.workmydeal.backend.service;

import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.model.StatusHistory;
import com.workmydeal.backend.repository.DealRepository;
import com.workmydeal.backend.repository.StatusHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

@Service
public class DealService {

    private final DealRepository dealRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final ForecastRecordService forecastRecordService;
    private final ReactivationService reactivationService;
    private final AuditHistoryService auditHistoryService;

    public DealService(
            DealRepository dealRepository,
            StatusHistoryRepository statusHistoryRepository,
            ForecastRecordService forecastRecordService,
            ReactivationService reactivationService,
            AuditHistoryService auditHistoryService
    ) {
        this.dealRepository = dealRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.forecastRecordService = forecastRecordService;
        this.reactivationService = reactivationService;
        this.auditHistoryService = auditHistoryService;
    }

    public List<Deal> getAllDeals() {
        return dealRepository.findAll();
    }

    public Deal getDealById(Long id) {
        return dealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Deal not found with id: " + id));
    }

    public Deal createDeal(Deal deal) {
        applyLifecycleRules(deal);

        Deal savedDeal = dealRepository.save(deal);

        forecastRecordService.saveSnapshot(savedDeal);
        auditHistoryService.record(
                "CREATE",
                "DEAL",
                savedDeal.getId(),
                savedDeal.getOwner(),
                "Deal created."
        );

        return savedDeal;
    }

    public Deal updateDeal(Long id, Deal updatedDeal) {
        Deal existingDeal = getDealById(id);

        if (
                updatedDeal.getUpdatedAt() != null &&
                existingDeal.getUpdatedAt() != null &&
                !updatedDeal.getUpdatedAt().equals(existingDeal.getUpdatedAt())
        ) {
            throw new RuntimeException("Deal was changed by another update. Refresh before saving.");
        }

        boolean reactivating =
                !"ACTIVE".equals(existingDeal.getDealStatus()) &&
                "ACTIVE".equals(updatedDeal.getDealStatus());

        // Track stage/status movement so leadership can review lifecycle changes.
        if (!Objects.equals(existingDeal.getStage(), updatedDeal.getStage())) {
            statusHistoryRepository.save(
                    new StatusHistory(
                            existingDeal.getId(),
                            "STAGE",
                            existingDeal.getStage(),
                            updatedDeal.getStage(),
                            updatedDeal.getOwner()
                    )
            );
        }

        if (!Objects.equals(existingDeal.getDealStatus(), updatedDeal.getDealStatus())) {
            statusHistoryRepository.save(
                    new StatusHistory(
                            existingDeal.getId(),
                            "STATUS",
                            existingDeal.getDealStatus(),
                            updatedDeal.getDealStatus(),
                            updatedDeal.getOwner()
                    )
            );
        }

        existingDeal.setDealName(updatedDeal.getDealName());
        existingDeal.setCompanyName(updatedDeal.getCompanyName());

        existingDeal.setContactName(updatedDeal.getContactName());
        existingDeal.setContactPhone(updatedDeal.getContactPhone());
        existingDeal.setContactEmail(updatedDeal.getContactEmail());
        existingDeal.setContactInformation(updatedDeal.getContactInformation());

        existingDeal.setDealValue(updatedDeal.getDealValue());
        existingDeal.setStage(updatedDeal.getStage());
        existingDeal.setLifecycleState(updatedDeal.getLifecycleState());
        existingDeal.setDealStatus(updatedDeal.getDealStatus());
        existingDeal.setDealType(updatedDeal.getDealType());
        existingDeal.setOwner(updatedDeal.getOwner());
        existingDeal.setProbability(updatedDeal.getProbability());

        existingDeal.setExpectedCloseDate(updatedDeal.getExpectedCloseDate());
        existingDeal.setLastContactDate(updatedDeal.getLastContactDate());
        existingDeal.setNextFollowUpDate(updatedDeal.getNextFollowUpDate());

        existingDeal.setContractStatus(updatedDeal.getContractStatus());
        existingDeal.setContractEndDate(updatedDeal.getContractEndDate());
        existingDeal.setNoticeWindowStartDays(updatedDeal.getNoticeWindowStartDays());
        existingDeal.setNoticeWindowEndDays(updatedDeal.getNoticeWindowEndDays());
        existingDeal.setRenewalTermMonths(updatedDeal.getRenewalTermMonths());

        existingDeal.setNotes(updatedDeal.getNotes());

        applyLifecycleRules(existingDeal);

        Deal savedDeal = dealRepository.save(existingDeal);

        forecastRecordService.saveSnapshot(savedDeal);

        if (reactivating) {
            reactivationService.reactivateDeal(
                    savedDeal.getId(),
                    savedDeal.getOwner(),
                    "Opportunity moved back to active status."
            );
        }

        auditHistoryService.record(
                "UPDATE",
                "DEAL",
                savedDeal.getId(),
                savedDeal.getOwner(),
                "Deal updated."
        );

        return savedDeal;
    }

    // Contract timing can move active deals into dormant or renewal-ready states.
    private void applyLifecycleRules(Deal deal) {
        if (
                "CLOSED_WON".equals(deal.getDealStatus()) ||
                "ARCHIVED".equals(deal.getDealStatus())
        ) {
            return;
        }

        if (
                "IN_CONTRACT".equals(deal.getContractStatus()) &&
                deal.getContractEndDate() != null
        ) {
            long daysUntilExpiration = ChronoUnit.DAYS.between(
                    LocalDate.now(),
                    deal.getContractEndDate()
            );

            if (daysUntilExpiration > 120) {
                deal.setDealStatus("DORMANT");
            }

            if (daysUntilExpiration >= 0 && daysUntilExpiration <= 120) {
                deal.setDealStatus("ACTIVE");
            }
        }
    }

    public void deleteDeal(Long id) {
        dealRepository.deleteById(id);
    }
}
