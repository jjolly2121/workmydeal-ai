package com.workmydeal.backend.config;

import com.workmydeal.backend.model.TouchTemplate;
import com.workmydeal.backend.repository.TouchTemplateRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TouchTemplateSeeder {

    @Bean
    CommandLineRunner seedTouchTemplates(TouchTemplateRepository touchTemplateRepository) {
        return args -> {
            seedIfMissing(
                    touchTemplateRepository,
                    "Relationship Touch",
                    "Checking in with a quick industry update and to see if priorities have shifted.",
                    30
            );

            seedIfMissing(
                    touchTemplateRepository,
                    "Value Message",
                    "Sharing a relevant value point tied to the customer's current goals.",
                    14
            );

            seedIfMissing(
                    touchTemplateRepository,
                    "Contract Renewal",
                    "Opening a renewal conversation before the notice window closes.",
                    7
            );
        };
    }

    private void seedIfMissing(
            TouchTemplateRepository touchTemplateRepository,
            String touchCategory,
            String exampleMessage,
            Integer defaultFrequency
    ) {
        if (touchTemplateRepository.findByTouchCategory(touchCategory).isPresent()) {
            return;
        }

        TouchTemplate template = new TouchTemplate();

        template.setTouchCategory(touchCategory);
        template.setExampleMessage(exampleMessage);
        template.setDefaultFrequency(defaultFrequency);
        template.setActiveStatus(true);

        touchTemplateRepository.save(template);
    }
}
