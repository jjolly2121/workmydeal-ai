package com.workmydeal.backend.service;

import com.workmydeal.backend.model.AuditHistory;
import com.workmydeal.backend.repository.AuditHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditHistoryService {

    private final AuditHistoryRepository auditHistoryRepository;

    public AuditHistoryService(AuditHistoryRepository auditHistoryRepository) {
        this.auditHistoryRepository = auditHistoryRepository;
    }

    public AuditHistory record(
            String actionType,
            String entityType,
            Long entityId,
            String performedBy,
            String details
    ) {
        return auditHistoryRepository.save(
                new AuditHistory(actionType, entityType, entityId, performedBy, details)
        );
    }

    public List<AuditHistory> getRecentAuditHistory() {
        return auditHistoryRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
