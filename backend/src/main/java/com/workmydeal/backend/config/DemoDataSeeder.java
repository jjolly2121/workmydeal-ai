package com.workmydeal.backend.config;

import com.workmydeal.backend.model.AuditHistory;
import com.workmydeal.backend.model.User;
import com.workmydeal.backend.repository.ActivityRepository;
import com.workmydeal.backend.repository.AuditHistoryRepository;
import com.workmydeal.backend.repository.AuthSessionRepository;
import com.workmydeal.backend.repository.DealRepository;
import com.workmydeal.backend.repository.ForecastRecordRepository;
import com.workmydeal.backend.repository.NoteRepository;
import com.workmydeal.backend.repository.ReactivationHistoryRepository;
import com.workmydeal.backend.repository.StatusHistoryRepository;
import com.workmydeal.backend.repository.TaskRepository;
import com.workmydeal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(200)
public class DemoDataSeeder implements org.springframework.boot.CommandLineRunner {

    private final ActivityRepository activityRepository;
    private final AuditHistoryRepository auditHistoryRepository;
    private final AuthSessionRepository authSessionRepository;
    private final DealRepository dealRepository;
    private final ForecastRecordRepository forecastRecordRepository;
    private final NoteRepository noteRepository;
    private final ReactivationHistoryRepository reactivationHistoryRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean demoEnabled;
    private final boolean resetOnStart;

    public DemoDataSeeder(
            ActivityRepository activityRepository,
            AuditHistoryRepository auditHistoryRepository,
            AuthSessionRepository authSessionRepository,
            DealRepository dealRepository,
            ForecastRecordRepository forecastRecordRepository,
            NoteRepository noteRepository,
            ReactivationHistoryRepository reactivationHistoryRepository,
            StatusHistoryRepository statusHistoryRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${workmydeal.demo.enabled:true}") boolean demoEnabled,
            @Value("${workmydeal.demo.reset-on-start:false}") boolean resetOnStart
    ) {
        this.activityRepository = activityRepository;
        this.auditHistoryRepository = auditHistoryRepository;
        this.authSessionRepository = authSessionRepository;
        this.dealRepository = dealRepository;
        this.forecastRecordRepository = forecastRecordRepository;
        this.noteRepository = noteRepository;
        this.reactivationHistoryRepository = reactivationHistoryRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.demoEnabled = demoEnabled;
        this.resetOnStart = resetOnStart;
    }

    @Override
    public void run(String... args) {
        if (!demoEnabled || (!resetOnStart && userRepository.count() > 0)) {
            return;
        }

        clearDemoTables();

        User admin = saveUser("Admin", "admin@test.com", "ADMIN", null);
        User managerA = saveUser("Morgan Manager", "manager@test.com", "MANAGER", null);
        User managerB = saveUser("Taylor Manager", "manager2@test.com", "MANAGER", null);

        saveUser("Alex Rep", "rep1@test.com", "REP", managerA.getId());
        saveUser("Jordan Rep", "rep2@test.com", "REP", managerA.getId());
        saveUser("Riley Rep", "rep3@test.com", "REP", managerA.getId());
        saveUser("Casey Rep", "rep4@test.com", "REP", managerB.getId());
        saveUser("Sam Rep", "rep5@test.com", "REP", managerB.getId());
        saveUser("Jamie Rep", "rep6@test.com", "REP", managerB.getId());

        auditHistoryRepository.save(
                new AuditHistory(
                        "SEED",
                        "DEMO_USERS",
                        admin.getId(),
                        "SYSTEM",
                        "Demo users loaded without seeded deal data."
                )
        );
    }

    // Keep the role demo users, but remove any local deal/history data before GitHub publishing.
    private void clearDemoTables() {
        authSessionRepository.deleteAll();
        activityRepository.deleteAll();
        noteRepository.deleteAll();
        reactivationHistoryRepository.deleteAll();
        statusHistoryRepository.deleteAll();
        forecastRecordRepository.deleteAll();
        taskRepository.deleteAll();
        auditHistoryRepository.deleteAll();
        dealRepository.deleteAll();

        if (resetOnStart) {
            userRepository.deleteAll();
        }
    }

    private User saveUser(String name, String email, String role, Long managerId) {
        User user = userRepository.findByEmail(email).orElseGet(User::new);

        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("test123"));
        user.setRole(role);
        user.setManagerId(managerId);
        user.setActiveStatus(true);

        return userRepository.save(user);
    }
}
