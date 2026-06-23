package com.workmydeal.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String activityType;

    @Column(length = 2000)
    private String notes;

    private String outcome;

    private String customerResponded;

    private String responseStatus;

    private String responseType;

    private LocalDateTime activityDate;

    @ManyToOne
    @JoinColumn(name = "deal_id")
    private Deal deal;

    public Activity() {
    }

    @PrePersist
    protected void onCreate() {
        this.activityDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getCustomerResponded() {
        return customerResponded;
    }

    public void setCustomerResponded(String customerResponded) {
        this.customerResponded = customerResponded;
    }

    public String getResponseStatus() {
        return responseStatus;
    }

    public void setResponseStatus(String responseStatus) {
        this.responseStatus = responseStatus;
    }

    public String getResponseType() {
        return responseType;
    }

    public void setResponseType(String responseType) {
        this.responseType = responseType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public LocalDateTime getActivityDate() {
        return activityDate;
    }

    public Deal getDeal() {
        return deal;
    }

    public void setDeal(Deal deal) {
        this.deal = deal;
    }
}