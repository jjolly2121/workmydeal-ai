package com.workmydeal.backend.service;

import com.workmydeal.backend.dto.CadenceRecommendation;
import com.workmydeal.backend.model.Activity;
import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.repository.ActivityRepository;
import com.workmydeal.backend.repository.DealRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final DealRepository dealRepository;
    private final CadenceService cadenceService;
    private final AuditHistoryService auditHistoryService;

    public ActivityService(
            ActivityRepository activityRepository,
            DealRepository dealRepository,
            CadenceService cadenceService,
            AuditHistoryService auditHistoryService
    ) {
        this.activityRepository = activityRepository;
        this.dealRepository = dealRepository;
        this.cadenceService = cadenceService;
        this.auditHistoryService = auditHistoryService;
    }

    public Activity createActivity(
            Long dealId,
            Activity activity
    ) {

        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Deal not found with id: " + dealId
                        )
                );

        activity.setDeal(deal);

        LocalDate today = LocalDate.now();

        deal.setLastContactDate(today);

        CadenceRecommendation recommendation =
                cadenceService.recommendCadence(deal);

        Integer days =
                recommendation.getRecommendedDaysBetweenTouches();

        if (days != null) {

            deal.setNextFollowUpDate(
                    today.plusDays(days)
            );

        }

        dealRepository.save(deal);

        Activity savedActivity = activityRepository.save(activity);

        auditHistoryService.record(
                "CREATE",
                "ACTIVITY",
                savedActivity.getId(),
                deal.getOwner(),
                "Activity logged for deal " + dealId
        );

        return savedActivity;
    }

    public List<Activity> getActivitiesByDealId(
            Long dealId
    ) {

        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Deal not found with id: " + dealId
                        )
                );

        return activityRepository.findByDeal(deal);

    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

}
