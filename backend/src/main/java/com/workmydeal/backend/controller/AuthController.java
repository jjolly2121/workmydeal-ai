package com.workmydeal.backend.controller;

import com.workmydeal.backend.model.AuthSession;
import com.workmydeal.backend.model.User;
import com.workmydeal.backend.repository.AuthSessionRepository;
import com.workmydeal.backend.repository.UserRepository;
import com.workmydeal.backend.service.AuditHistoryService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final AuthSessionRepository authSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditHistoryService auditHistoryService;

    public AuthController(
            UserRepository userRepository,
            AuthSessionRepository authSessionRepository,
            PasswordEncoder passwordEncoder,
            AuditHistoryService auditHistoryService
    ) {
        this.userRepository = userRepository;
        this.authSessionRepository = authSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditHistoryService = auditHistoryService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!passwordMatches(password, user)) {
            throw new RuntimeException("Invalid email or password.");
        }

        if (user.getActiveStatus() != null && !user.getActiveStatus()) {
            throw new RuntimeException("User account is inactive.");
        }

        AuthSession session = authSessionRepository.save(
                new AuthSession(
                        user.getId(),
                        UUID.randomUUID().toString(),
                        LocalDateTime.now().plusHours(8)
                )
        );

        auditHistoryService.record(
                "LOGIN",
                "USER",
                user.getId(),
                user.getName(),
                "User logged in through token session endpoint."
        );

        return Map.of(
                "token", session.getToken(),
                "expiresAt", session.getExpiresAt(),
                "user", user
        );
    }

    @PostMapping("/logout")
    public void logout(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        AuthSession session = authSessionRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Session not found."));

        session.setActiveStatus(false);
        authSessionRepository.save(session);
    }

    @GetMapping("/validate")
    public Map<String, Object> validateSession(@RequestParam String token) {
        AuthSession session = authSessionRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Session not found."));

        boolean valid =
                Boolean.TRUE.equals(session.getActiveStatus()) &&
                session.getExpiresAt().isAfter(LocalDateTime.now());

        return Map.of(
                "valid", valid,
                "userId", session.getUserId(),
                "expiresAt", session.getExpiresAt()
        );
    }

    private boolean passwordMatches(String rawPassword, User user) {
        String storedPassword = user.getPassword();

        if (storedPassword == null) {
            return false;
        }

        if (isBcryptHash(storedPassword)) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }

        boolean matchesLegacyPassword = storedPassword.equals(rawPassword);

        if (matchesLegacyPassword) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
        }

        return matchesLegacyPassword;
    }

    private boolean isBcryptHash(String value) {
        return value.startsWith("$2a$")
                || value.startsWith("$2b$")
                || value.startsWith("$2y$");
    }
}
