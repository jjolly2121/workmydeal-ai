package com.workmydeal.backend.service;

import com.workmydeal.backend.dto.CadenceRecommendation;
import com.workmydeal.backend.dto.ExecutionRecommendation;
import com.workmydeal.backend.dto.PriorityRecommendation;
import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.model.Task;
import com.workmydeal.backend.repository.DealRepository;
import com.workmydeal.backend.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExecutionService {

    private final DealRepository dealRepository;
    private final TaskRepository taskRepository;
    private final PriorityService priorityService;
    private final CadenceService cadenceService;

    public ExecutionService(
            DealRepository dealRepository,
            TaskRepository taskRepository,
            PriorityService priorityService,
            CadenceService cadenceService
    ) {
        this.dealRepository = dealRepository;
        this.taskRepository = taskRepository;
        this.priorityService = priorityService;
        this.cadenceService = cadenceService;
    }

    public List<ExecutionRecommendation> buildExecutionQueue() {
        // Daily execution starts from active deals only.
        List<Deal> deals = dealRepository
                .findAll()
                .stream()
                .filter(deal ->
                        deal.getDealStatus() != null
                                && deal.getDealStatus().equals("ACTIVE")
                )
                .toList();

        return buildExecutionQueueFromDeals(deals);
    }

    public List<ExecutionRecommendation> buildExecutionQueueForUser(
            Long userId,
            String name
    ) {
        List<Deal> deals = dealRepository
                .findAll()
                .stream()
                .filter(deal ->
                        deal.getDealStatus() != null
                                && deal.getDealStatus().equals("ACTIVE")
                )
                .filter(deal ->
                        (deal.getOwnerId() != null && deal.getOwnerId().equals(userId))
                                || (deal.getOwnerId() == null
                                && name != null
                                && name.equals(deal.getOwner()))
                )
                .toList();

        return buildExecutionQueueFromDeals(deals);
    }

    private List<ExecutionRecommendation> buildExecutionQueueFromDeals(List<Deal> deals) {
        List<ExecutionRecommendation> queue = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Deal deal : deals) {
            // Priority and cadence together decide if the deal belongs in required work.
            PriorityRecommendation priority =
                    priorityService.calculatePriority(deal);

            CadenceRecommendation cadence =
                    cadenceService.recommendCadence(deal);

            boolean needsAttention = true;

            if (
                    deal.getLastContactDate() != null
                            && cadence.getRecommendedDaysBetweenTouches() != null
            ) {
                long daysSinceTouch = ChronoUnit.DAYS.between(
                        deal.getLastContactDate(),
                        today
                );

                needsAttention =
                        daysSinceTouch >= cadence.getRecommendedDaysBetweenTouches();
            }

            boolean overdue = false;

            if (deal.getNextFollowUpDate() != null) {
                overdue = deal.getNextFollowUpDate().isBefore(today);
            }

            String priorityType = needsAttention ? "REQUIRED" : "STRETCH";

            // Tasks are persisted so completion state survives page reloads.
            Task task = getOrCreateTask(
                    deal.getId(),
                    priorityType,
                    today
            );

            boolean completed =
                    task.getCompleted() != null && task.getCompleted();

            queue.add(
                    new ExecutionRecommendation(
                            deal.getId(),
                            deal.getDealName(),
                            priority.getPriorityScore(),
                            cadence.getCadenceLevel(),
                            needsAttention,
                            overdue,
                            completed,
                            priority.getReason(),
                            deal.getLastContactDate(),
                            deal.getNextFollowUpDate()
                    )
            );
        }

        // Keep unfinished, overdue, and higher-priority work at the top of the queue.
        queue.sort((a, b) -> {
            if (!a.getCompleted().equals(b.getCompleted())) {
                return Boolean.compare(
                        a.getCompleted(),
                        b.getCompleted()
                );
            }

            if (!a.getOverdue().equals(b.getOverdue())) {
                return Boolean.compare(
                        b.getOverdue(),
                        a.getOverdue()
                );
            }

            boolean aDueToday =
                    a.getNextFollowUpDate() != null
                            && a.getNextFollowUpDate().isEqual(LocalDate.now());

            boolean bDueToday =
                    b.getNextFollowUpDate() != null
                            && b.getNextFollowUpDate().isEqual(LocalDate.now());

            if (aDueToday != bDueToday) {
                return Boolean.compare(
                        bDueToday,
                        aDueToday
                );
            }

            if (!a.getNeedsAttention().equals(b.getNeedsAttention())) {
                return Boolean.compare(
                        b.getNeedsAttention(),
                        a.getNeedsAttention()
                );
            }

            return Integer.compare(
                    b.getPriorityScore(),
                    a.getPriorityScore()
            );
        });

        return queue;
    }

    private Task getOrCreateTask(
            Long dealId,
            String priorityType,
            LocalDate dueDate
    ) {
        List<Task> existingTasks =
                taskRepository.findAllByDealIdAndDueDate(
                        dealId,
                        dueDate
                );

        if (!existingTasks.isEmpty()) {
            return existingTasks.get(0);
        }

        return taskRepository.save(
                new Task(
                        dealId,
                        "FOLLOW_UP",
                        priorityType,
                        dueDate
                )
        );
    }

    public void completeTask(Long dealId) {
        Task task = getOrCreateTask(
                dealId,
                "REQUIRED",
                LocalDate.now()
        );

        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());

        taskRepository.save(task);
    }

    public void reopenTask(Long dealId) {
        List<Task> existingTasks =
                taskRepository.findAllByDealIdAndDueDate(
                        dealId,
                        LocalDate.now()
                );

        if (existingTasks.isEmpty()) {
            throw new RuntimeException(
                    "Task not found for deal id: " + dealId
            );
        }

        Task task = existingTasks.get(0);

        task.setCompleted(false);
        task.setCompletedAt(null);

        taskRepository.save(task);
    }
}
