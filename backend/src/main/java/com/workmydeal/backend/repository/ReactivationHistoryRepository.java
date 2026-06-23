package com.workmydeal.backend.repository;

import com.workmydeal.backend.model.ReactivationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReactivationHistoryRepository extends JpaRepository<ReactivationHistory, Long> {

    List<ReactivationHistory> findByDealIdOrderByReactivatedAtDesc(Long dealId);
}
