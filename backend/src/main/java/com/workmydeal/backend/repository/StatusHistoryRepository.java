package com.workmydeal.backend.repository;

import com.workmydeal.backend.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByDealIdOrderByChangedAtDesc(Long dealId);
}