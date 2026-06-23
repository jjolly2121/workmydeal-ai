package com.workmydeal.backend.repository;

import com.workmydeal.backend.model.Deal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DealRepository extends JpaRepository<Deal, Long> {

    boolean existsByDealNameAndCompanyName(
            String dealName,
            String companyName
    );
}