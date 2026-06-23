package com.workmydeal.backend.config;

import com.workmydeal.backend.model.Cadence;
import com.workmydeal.backend.repository.CadenceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Configuration
public class CadenceSeeder {

    private static final Set<String> DEFAULT_RULE_TYPES = Set.of(
            "NEW_LEAD",
            "QUALIFIED",
            "DISCOVERY",
            "PROPOSAL",
            "NEGOTIATION",
            "VERBAL",
            "DORMANT",
            "CONTRACT_WARMUP",
            "CONTRACT_NOTICE_WINDOW"
    );

    @Bean
    CommandLineRunner seedCadenceRules(CadenceRepository cadenceRepository) {
        return args -> {
            // Keep the demo database aligned with the supported cadence rules.
            removeNonDefaultRules(cadenceRepository);

            seedIfMissing(cadenceRepository, "NEW_LEAD", 3, "Initial Outreach", true);
            seedIfMissing(cadenceRepository, "QUALIFIED", 7, "Qualified Follow-Up", true);
            seedIfMissing(cadenceRepository, "DISCOVERY", 7, "Discovery Follow-Up", true);
            seedIfMissing(cadenceRepository, "PROPOSAL", 3, "Proposal Follow-Up", true);
            seedIfMissing(cadenceRepository, "NEGOTIATION", 2, "Negotiation Follow-Up", true);
            seedIfMissing(cadenceRepository, "VERBAL", 2, "Verbal Commitment Follow-Up", true);
            seedIfMissing(cadenceRepository, "DORMANT", 90, "Dormant Relationship Touch", false);
            seedIfMissing(cadenceRepository, "CONTRACT_WARMUP", 30, "Contract Warm-Up", false);
            seedIfMissing(
                    cadenceRepository,
                    "CONTRACT_NOTICE_WINDOW",
                    7,
                    "Contract Renewal Priority",
                    true
            );
        };
    }

    private void removeNonDefaultRules(CadenceRepository cadenceRepository) {
        List<Cadence> cadences = cadenceRepository.findAll();

        cadences.stream()
                .filter(cadence ->
                        cadence.getCadenceType() == null
                                || !DEFAULT_RULE_TYPES.contains(cadence.getCadenceType())
                )
                .forEach(cadenceRepository::delete);
    }

    private void seedIfMissing(
            CadenceRepository cadenceRepository,
            String cadenceType,
            Integer frequencyDays,
            String touchCategory,
            Boolean requiredFlag
    ) {
        boolean alreadyExists = cadenceRepository.findAll()
                .stream()
                .anyMatch(cadence -> cadenceType.equals(cadence.getCadenceType()));

        if (alreadyExists) {
            return;
        }

        Cadence cadence = new Cadence();

        cadence.setCadenceType(cadenceType);
        cadence.setFrequencyDays(frequencyDays);
        cadence.setNextTouchDate(LocalDate.now().plusDays(frequencyDays));
        cadence.setTouchCategory(touchCategory);
        cadence.setRequiredFlag(requiredFlag);
        cadence.setActiveStatus(true);

        cadenceRepository.save(cadence);
    }
}
