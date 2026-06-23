package com.workmydeal.backend.repository;

import com.workmydeal.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByDealIdAndDueDate(Long dealId, LocalDate dueDate);
}