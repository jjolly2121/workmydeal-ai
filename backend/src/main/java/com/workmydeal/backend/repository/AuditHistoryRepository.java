package com.workmydeal.backend.repository;

import com.workmydeal.backend.model.AuditHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditHistoryRepository extends JpaRepository<AuditHistory, Long> {

    List<AuditHistory> findTop50ByOrderByCreatedAtDesc();
}
