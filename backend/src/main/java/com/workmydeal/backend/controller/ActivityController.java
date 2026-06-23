package com.workmydeal.backend.controller;

import com.workmydeal.backend.model.Activity;
import com.workmydeal.backend.service.ActivityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals/{dealId}/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping
    public Activity createActivity(@PathVariable Long dealId, @RequestBody Activity activity) {
        return activityService.createActivity(dealId, activity);
    }

    @GetMapping
    public List<Activity> getActivitiesByDealId(@PathVariable Long dealId) {
        return activityService.getActivitiesByDealId(dealId);
    }
}
