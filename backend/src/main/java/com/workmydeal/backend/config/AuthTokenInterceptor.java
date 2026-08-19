package com.workmydeal.backend.config;

import com.workmydeal.backend.model.AuthSession;
import com.workmydeal.backend.model.User;
import com.workmydeal.backend.repository.AuthSessionRepository;
import com.workmydeal.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
public class AuthTokenInterceptor implements HandlerInterceptor {

    private final AuthSessionRepository authSessionRepository;
    private final UserRepository userRepository;

    public AuthTokenInterceptor(
            AuthSessionRepository authSessionRepository,
            UserRepository userRepository
    ) {
        this.authSessionRepository = authSessionRepository;
        this.userRepository = userRepository;
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

        User user = userRepository.findById(session.getUserId()).orElse(null);

        if (user == null || !Boolean.TRUE.equals(user.getActiveStatus())) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User account is unavailable.");
            return false;
        }

        boolean modifiesUsers =
                path.startsWith("/api/users") &&
                !"GET".equalsIgnoreCase(request.getMethod());
        boolean readsAuditHistory = path.startsWith("/api/audit-history");

        if (
                (modifiesUsers || readsAuditHistory) &&
                !"ADMIN".equalsIgnoreCase(user.getRole())
        ) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Administrator access is required.");
            return false;
        }

        request.setAttribute("authenticatedUserId", user.getId());
        request.setAttribute("authenticatedUserRole", user.getRole());

        return true;
    }
}
