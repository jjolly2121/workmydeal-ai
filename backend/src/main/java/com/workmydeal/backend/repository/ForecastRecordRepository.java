package com.workmydeal.backend.repository;

import com.workmydeal.backend.model.ForecastRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForecastRecordRepository extends JpaRepository<ForecastRecord, Long> {

    List<ForecastRecord> findByDealIdOrderByCreatedAtDesc(Long dealId);
}
