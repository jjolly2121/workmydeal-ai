package com.workmydeal.backend.controller;

import com.workmydeal.backend.dto.ForecastInsight;
import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.model.ForecastRecord;
import com.workmydeal.backend.service.DealService;
import com.workmydeal.backend.service.ForecastIntelligenceService;
import com.workmydeal.backend.service.ForecastRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private final ForecastRecordService forecastRecordService;
    private final ForecastIntelligenceService forecastIntelligenceService;
    private final DealService dealService;

    public ForecastController(
            ForecastRecordService forecastRecordService,
            ForecastIntelligenceService forecastIntelligenceService,
            DealService dealService
    ) {
        this.forecastRecordService = forecastRecordService;
        this.forecastIntelligenceService = forecastIntelligenceService;
        this.dealService = dealService;
    }

    @GetMapping("/records")
    public List<ForecastRecord> getForecastRecords() {
        return forecastRecordService.getAllForecastRecords();
    }

    @GetMapping("/deals/{dealId}/records")
    public List<ForecastRecord> getForecastRecordsByDeal(@PathVariable Long dealId) {
        return forecastRecordService.getForecastRecordsByDeal(dealId);
    }

    @PostMapping("/deals/{dealId}/snapshot")
    public ForecastRecord createForecastSnapshot(@PathVariable Long dealId) {
        return forecastRecordService.createSnapshotForDeal(dealId);
    }

    @GetMapping("/deals/{dealId}/insight")
    public ForecastInsight getForecastInsight(@PathVariable Long dealId) {
        Deal deal = dealService.getDealById(dealId);
        return forecastIntelligenceService.buildForecastInsight(deal);
    }
}
