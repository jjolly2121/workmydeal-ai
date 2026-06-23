package com.workmydeal.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class AuditHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String actionType;

    private String entityType;

    private Long entityId;

    private String performedBy;

    @Column(length = 1000)
    private String details;

    private LocalDateTime createdAt;

    public AuditHistory() {
    }

    public AuditHistory(
            String actionType,
            String entityType,
            Long entityId,
            String performedBy,
            String details
    ) {
        this.actionType = actionType;
        this.entityType = entityType;
        this.entityId = entityId;
        this.performedBy = performedBy;
        this.details = details;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getActionType() {
        return actionType;
    }

    public String getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public String getDetails() {
        return details;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
