package com.workmydeal.backend.controller;

import com.workmydeal.backend.dto.ExecutionRecommendation;
import com.workmydeal.backend.service.ExecutionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final ExecutionService executionService;

    public TaskController(ExecutionService executionService) {
        this.executionService = executionService;
    }

    @GetMapping
    public List<ExecutionRecommendation> getTasks(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String name
    ) {
        if ("REP".equalsIgnoreCase(role) && userId != null) {
            return executionService.buildExecutionQueueForUser(userId, name);
        }

        return executionService.buildExecutionQueue();
    }

    @PostMapping("/{dealId}/complete")
    public void completeTask(@PathVariable Long dealId) {
        executionService.completeTask(dealId);
    }

    @PostMapping("/{dealId}/reopen")
    public void reopenTask(@PathVariable Long dealId) {
        executionService.reopenTask(dealId);
    }
}
