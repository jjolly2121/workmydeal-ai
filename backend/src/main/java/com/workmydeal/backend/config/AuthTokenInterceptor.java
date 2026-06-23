package com.workmydeal.backend.config;

import com.workmydeal.backend.model.AuthSession;
import com.workmydeal.backend.repository.AuthSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
public class AuthTokenInterceptor implements HandlerInterceptor {

    private final AuthSessionRepository authSessionRepository;

    public AuthTokenInterceptor(AuthSessionRepository authSessionRepository) {
        this.authSessionRepository = authSessionRepository;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();

        if (
                path.equals("/api/auth/login") ||
                path.equals("/api/auth/validate")
        ) {
            return true;
        }

        String token = request.getHeader("X-Auth-Token");

        if (token == null || token.isBlank()) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing auth token.");
            return false;
        }

        AuthSession session = authSessionRepository.findByToken(token)
                .orElse(null);

        if (
                session == null ||
                !Boolean.TRUE.equals(session.getActiveStatus()) ||
                session.getExpiresAt().isBefore(LocalDateTime.now())
        ) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired auth token.");
            return false;
        }

        return true;
    }
}
