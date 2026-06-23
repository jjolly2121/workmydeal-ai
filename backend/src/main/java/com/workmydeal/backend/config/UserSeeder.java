package com.workmydeal.backend.config;

import com.workmydeal.backend.model.User;
import com.workmydeal.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserSeeder {

    @Bean
    CommandLineRunner seedUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Seed demo users only when the local database is empty.
            if (userRepository.count() > 0) {
                return;
            }

            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("test123"));
            admin.setRole("ADMIN");
            admin.setActiveStatus(true);
            userRepository.save(admin);

            User managerA = new User();
            managerA.setName("Morgan Manager");
            managerA.setEmail("manager@test.com");
            managerA.setPassword(passwordEncoder.encode("test123"));
            managerA.setRole("MANAGER");
            managerA.setActiveStatus(true);
            userRepository.save(managerA);

            User managerB = new User();
            managerB.setName("Taylor Manager");
            managerB.setEmail("manager2@test.com");
            managerB.setPassword(passwordEncoder.encode("test123"));
            managerB.setRole("MANAGER");
            managerB.setActiveStatus(true);
            userRepository.save(managerB);

            User repA = new User();
            repA.setName("Alex Rep");
            repA.setEmail("rep1@test.com");
            repA.setPassword(passwordEncoder.encode("test123"));
            repA.setRole("REP");
            repA.setManagerId(managerA.getId());
            repA.setActiveStatus(true);
            userRepository.save(repA);

            User repB = new User();
            repB.setName("Jordan Rep");
            repB.setEmail("rep2@test.com");
            repB.setPassword(passwordEncoder.encode("test123"));
            repB.setRole("REP");
            repB.setManagerId(managerA.getId());
            repB.setActiveStatus(true);
            userRepository.save(repB);

            User repC = new User();
            repC.setName("Riley Rep");
            repC.setEmail("rep3@test.com");
            repC.setPassword(passwordEncoder.encode("test123"));
            repC.setRole("REP");
            repC.setManagerId(managerA.getId());
            repC.setActiveStatus(true);
            userRepository.save(repC);

            User repD = new User();
            repD.setName("Casey Rep");
            repD.setEmail("rep4@test.com");
            repD.setPassword(passwordEncoder.encode("test123"));
            repD.setRole("REP");
            repD.setManagerId(managerB.getId());
            repD.setActiveStatus(true);
            userRepository.save(repD);

            User repE = new User();
            repE.setName("Sam Rep");
            repE.setEmail("rep5@test.com");
            repE.setPassword(passwordEncoder.encode("test123"));
            repE.setRole("REP");
            repE.setManagerId(managerB.getId());
            repE.setActiveStatus(true);
            userRepository.save(repE);

            User repF = new User();
            repF.setName("Jamie Rep");
            repF.setEmail("rep6@test.com");
            repF.setPassword(passwordEncoder.encode("test123"));
            repF.setRole("REP");
            repF.setManagerId(managerB.getId());
            repF.setActiveStatus(true);
            userRepository.save(repF);
        };
    }
}
