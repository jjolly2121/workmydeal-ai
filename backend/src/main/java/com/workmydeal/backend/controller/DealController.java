package com.workmydeal.backend.controller;

import com.workmydeal.backend.dto.ActionRecommendation;
import com.workmydeal.backend.dto.CadenceRecommendation;
import com.workmydeal.backend.dto.PriorityRecommendation;
import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.model.StatusHistory;
import com.workmydeal.backend.repository.StatusHistoryRepository;
import com.workmydeal.backend.service.ActionRecommendationService;
import com.workmydeal.backend.service.CadenceService;
import com.workmydeal.backend.service.DealService;
import com.workmydeal.backend.service.PriorityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private final DealService dealService;
    private final CadenceService cadenceService;
    private final PriorityService priorityService;
    private final ActionRecommendationService actionRecommendationService;
    private final StatusHistoryRepository statusHistoryRepository;

    public DealController(
            DealService dealService,
            CadenceService cadenceService,
            PriorityService priorityService,
            ActionRecommendationService actionRecommendationService,
            StatusHistoryRepository statusHistoryRepository
    ) {
        this.dealService = dealService;
        this.cadenceService = cadenceService;
        this.priorityService = priorityService;
        this.actionRecommendationService = actionRecommendationService;
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @GetMapping
    public List<Deal> getAllDeals() {
        return dealService.getAllDeals();
    }

    @GetMapping("/{id}")
    public Deal getDealById(@PathVariable Long id) {
        return dealService.getDealById(id);
    }

    @GetMapping("/{id}/cadence")
    public CadenceRecommendation getCadenceRecommendation(@PathVariable Long id) {
        Deal deal = dealService.getDealById(id);
        return cadenceService.recommendCadence(deal);
    }

    @GetMapping("/{id}/priority")
    public PriorityRecommendation getPriority(@PathVariable Long id) {
        Deal deal = dealService.getDealById(id);
        return priorityService.calculatePriority(deal);
    }

    @GetMapping("/{id}/recommendation")
    public ActionRecommendation getActionRecommendation(@PathVariable Long id) {
        Deal deal = dealService.getDealById(id);
        return actionRecommendationService.recommendAction(deal);
    }

    // Lifecycle history supports manager/admin review in the deal detail page.
    @GetMapping("/{id}/history")
    public List<StatusHistory> getStatusHistory(@PathVariable Long id) {
        return statusHistoryRepository.findByDealIdOrderByChangedAtDesc(id);
    }

    @PostMapping
    public Deal createDeal(@RequestBody Deal deal) {
        return dealService.createDeal(deal);
    }

    @PutMapping("/{id}")
    public Deal updateDeal(@PathVariable Long id, @RequestBody Deal updatedDeal) {
        return dealService.updateDeal(id, updatedDeal);
    }

    @DeleteMapping("/{id}")
    public void deleteDeal(@PathVariable Long id) {
        dealService.deleteDeal(id);
    }
}
