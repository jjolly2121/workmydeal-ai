package com.workmydeal.backend.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class ForecastRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long dealId;

    private BigDecimal dealValue;

    private Integer probability;

    private BigDecimal weightedValue;

    private LocalDate forecastMonth;

    private LocalDateTime createdAt;

    public ForecastRecord() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getDealId() {
        return dealId;
    }

    public void setDealId(Long dealId) {
        this.dealId = dealId;
    }

    public BigDecimal getDealValue() {
        return dealValue;
    }

    public void setDealValue(BigDecimal dealValue) {
        this.dealValue = dealValue;
    }

    public Integer getProbability() {
        return probability;
    }

    public void setProbability(Integer probability) {
        this.probability = probability;
    }

    public BigDecimal getWeightedValue() {
        return weightedValue;
    }

    public void setWeightedValue(BigDecimal weightedValue) {
        this.weightedValue = weightedValue;
    }

    public LocalDate getForecastMonth() {
        return forecastMonth;
    }

    public void setForecastMonth(LocalDate forecastMonth) {
        this.forecastMonth = forecastMonth;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
