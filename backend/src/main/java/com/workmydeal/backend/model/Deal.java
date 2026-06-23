package com.workmydeal.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String dealName;
    private String companyName;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private String contactInformation;
    private BigDecimal dealValue;
    private String stage;
    private String lifecycleState;
    private String dealStatus;
    private String dealType;
    private String owner;
    private Long ownerId;
    private Integer probability;

    private LocalDate expectedCloseDate;
    private LocalDate lastContactDate;
    private LocalDate nextFollowUpDate;

    private String contractStatus;
    private LocalDate contractEndDate;
    private Integer noticeWindowStartDays = 120;
    private Integer noticeWindowEndDays = 90;
    private Integer renewalTermMonths = 12;


    @Column(length = 2000)
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Deal() {
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        if (this.lifecycleState == null) {
            this.lifecycleState = "ACTIVE";
        }

        if (this.dealStatus == null) {
            this.dealStatus = "ACTIVE";
        }

        if (this.noticeWindowStartDays == null) {
            this.noticeWindowStartDays = 120;
        }

        if (this.noticeWindowEndDays == null) {
            this.noticeWindowEndDays = 90;
        }

        if (this.renewalTermMonths == null) {
            this.renewalTermMonths = 12;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getDealName() {
        return dealName;
    }

    public void setDealName(String dealName) {
        this.dealName = dealName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactInformation() {
        return contactInformation;
    }

    public void setContactInformation(String contactInformation) {
        this.contactInformation = contactInformation;
    }

    public BigDecimal getDealValue() {
        return dealValue;
    }

    public void setDealValue(BigDecimal dealValue) {
        this.dealValue = dealValue;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getLifecycleState() {
        return lifecycleState;
    }

    public void setLifecycleState(String lifecycleState) {
        this.lifecycleState = lifecycleState;
    }

    public String getDealStatus() {
        return dealStatus;
    }

    public void setDealStatus(String dealStatus) {
        this.dealStatus = dealStatus;
    }

    public String getDealType() {
        return dealType;
    }

    public void setDealType(String dealType) {
        this.dealType = dealType;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Integer getProbability() {
        return probability;
    }

    public void setProbability(Integer probability) {
        this.probability = probability;
    }

    public LocalDate getExpectedCloseDate() {
        return expectedCloseDate;
    }

    public void setExpectedCloseDate(LocalDate expectedCloseDate) {
        this.expectedCloseDate = expectedCloseDate;
    }

    public LocalDate getLastContactDate() {
        return lastContactDate;
    }

    public void setLastContactDate(LocalDate lastContactDate) {
        this.lastContactDate = lastContactDate;
    }

    public LocalDate getNextFollowUpDate() {
        return nextFollowUpDate;
    }

    public void setNextFollowUpDate(LocalDate nextFollowUpDate) {
        this.nextFollowUpDate = nextFollowUpDate;
    }

    public String getContractStatus() {
        return contractStatus;
    }

    public void setContractStatus(String contractStatus) {
        this.contractStatus = contractStatus;
    }

    public LocalDate getContractEndDate() {
        return contractEndDate;
    }

    public void setContractEndDate(LocalDate contractEndDate) {
        this.contractEndDate = contractEndDate;
    }

    public Integer getNoticeWindowStartDays() {
        return noticeWindowStartDays;
    }

    public void setNoticeWindowStartDays(Integer noticeWindowStartDays) {
        this.noticeWindowStartDays = noticeWindowStartDays;
    }

    public Integer getNoticeWindowEndDays() {
        return noticeWindowEndDays;
    }

    public void setNoticeWindowEndDays(Integer noticeWindowEndDays) {
        this.noticeWindowEndDays = noticeWindowEndDays;
    }

    public Integer getRenewalTermMonths() {
        return renewalTermMonths;
    }

    public void setRenewalTermMonths(Integer renewalTermMonths) {
        this.renewalTermMonths = renewalTermMonths;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
}