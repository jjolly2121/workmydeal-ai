package com.workmydeal.backend.repository;

import com.workmydeal.backend.model.TouchTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TouchTemplateRepository extends JpaRepository<TouchTemplate, Long> {

    Optional<TouchTemplate> findByTouchCategory(String touchCategory);
}
