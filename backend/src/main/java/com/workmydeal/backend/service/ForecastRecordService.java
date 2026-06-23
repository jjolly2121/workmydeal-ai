package com.workmydeal.backend.service;

import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.model.ForecastRecord;
import com.workmydeal.backend.repository.DealRepository;
import com.workmydeal.backend.repository.ForecastRecordRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ForecastRecordService {

    private final ForecastRecordRepository forecastRecordRepository;
    private final DealRepository dealRepository;

    public ForecastRecordService(
            ForecastRecordRepository forecastRecordRepository,
            DealRepository dealRepository
    ) {
        this.forecastRecordRepository = forecastRecordRepository;
        this.dealRepository = dealRepository;
    }

    public ForecastRecord saveSnapshot(Deal deal) {
        BigDecimal dealValue = deal.getDealValue() == null
                ? BigDecimal.ZERO
                : deal.getDealValue();

        BigDecimal weightedValue = dealValue.multiply(
                BigDecimal.valueOf(NumberUtils.safePercent(deal.getProbability()))
        );

        LocalDate forecastMonth = deal.getExpectedCloseDate() == null
                ? LocalDate.now().withDayOfMonth(1)
                : deal.getExpectedCloseDate().withDayOfMonth(1);

        ForecastRecord forecastRecord = new ForecastRecord();

        forecastRecord.setDealId(deal.getId());
        forecastRecord.setDealValue(dealValue);
        forecastRecord.setProbability(deal.getProbability());
        forecastRecord.setWeightedValue(weightedValue);
        forecastRecord.setForecastMonth(forecastMonth);

        return forecastRecordRepository.save(forecastRecord);
    }

    public List<ForecastRecord> getAllForecastRecords() {
        return forecastRecordRepository.findAll();
    }

    public List<ForecastRecord> getForecastRecordsByDeal(Long dealId) {
        return forecastRecordRepository.findByDealIdOrderByCreatedAtDesc(dealId);
    }

    public ForecastRecord createSnapshotForDeal(Long dealId) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with id: " + dealId));

        return saveSnapshot(deal);
    }

    private static class NumberUtils {
        private static double safePercent(Integer probability) {
            return Number(probability) / 100.0;
        }

        private static int Number(Integer value) {
            return value == null ? 0 : value;
        }
    }
}
