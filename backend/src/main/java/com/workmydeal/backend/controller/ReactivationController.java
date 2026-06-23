package com.workmydeal.backend.controller;

import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.model.ReactivationHistory;
import com.workmydeal.backend.service.ReactivationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deals/{dealId}/reactivation")
public class ReactivationController {

    private final ReactivationService reactivationService;

    public ReactivationController(ReactivationService reactivationService) {
        this.reactivationService = reactivationService;
    }

    @PostMapping
    public Deal reactivateDeal(
            @PathVariable Long dealId,
            @RequestBody(required = false) Map<String, String> request
    ) {
        String reactivatedBy = request == null ? "SYSTEM" : request.get("reactivatedBy");
        String reason = request == null ? "Manual reactivation" : request.get("reason");

        return reactivationService.reactivateDeal(dealId, reactivatedBy, reason);
    }

    @GetMapping("/history")
    public List<ReactivationHistory> getReactivationHistory(@PathVariable Long dealId) {
        return reactivationService.getReactivationHistory(dealId);
    }
}
