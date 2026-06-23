package com.workmydeal.backend.controller;

import com.workmydeal.backend.model.AuditHistory;
import com.workmydeal.backend.service.AuditHistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-history")
public class AuditHistoryController {

    private final AuditHistoryService auditHistoryService;

    public AuditHistoryController(AuditHistoryService auditHistoryService) {
        this.auditHistoryService = auditHistoryService;
    }

    @GetMapping
    public List<AuditHistory> getRecentAuditHistory() {
        return auditHistoryService.getRecentAuditHistory();
    }
}
