package com.workmydeal.backend.repository;

import com.workmydeal.backend.model.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {

    Optional<AuthSession> findByToken(String token);
}
