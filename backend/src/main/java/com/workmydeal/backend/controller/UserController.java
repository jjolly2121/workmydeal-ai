package com.workmydeal.backend.controller;

import com.workmydeal.backend.model.User;
import com.workmydeal.backend.repository.UserRepository;
import com.workmydeal.backend.service.AuditHistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditHistoryService auditHistoryService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuditHistoryService auditHistoryService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditHistoryService = auditHistoryService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        User savedUser = userRepository.save(user);

        auditHistoryService.record(
                "CREATE",
                "USER",
                savedUser.getId(),
                savedUser.getName(),
                "User created with role " + savedUser.getRole()
        );

        return savedUser;
    }

    @PutMapping("/{id}")
    public User updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser
    ) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        if (
                updatedUser.getPassword() != null &&
                !updatedUser.getPassword().isBlank() &&
                !updatedUser.getPassword().startsWith("$2a$") &&
                !updatedUser.getPassword().startsWith("$2b$") &&
                !updatedUser.getPassword().startsWith("$2y$")
        ) {
            existingUser.setPassword(
                    passwordEncoder.encode(updatedUser.getPassword())
            );
        }
        existingUser.setRole(updatedUser.getRole());
        existingUser.setManagerId(updatedUser.getManagerId());
        existingUser.setActiveStatus(updatedUser.getActiveStatus());

        User savedUser = userRepository.save(existingUser);

        auditHistoryService.record(
                "UPDATE",
                "USER",
                savedUser.getId(),
                savedUser.getName(),
                "User role/status updated."
        );

        return savedUser;
    }

    @PutMapping("/{id}/password")
    public User resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        String newPassword = request.get("password");

        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("Password is required.");
        }

        existingUser.setPassword(passwordEncoder.encode(newPassword));

        User savedUser = userRepository.save(existingUser);

        auditHistoryService.record(
                "PASSWORD_RESET",
                "USER",
                savedUser.getId(),
                savedUser.getName(),
                "User password reset."
        );

        return savedUser;
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        userRepository.delete(existingUser);

        auditHistoryService.record(
                "DELETE",
                "USER",
                id,
                existingUser.getName(),
                "User deleted."
        );
    }

}
