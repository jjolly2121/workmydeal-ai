package com.workmydeal.backend.service;

import com.workmydeal.backend.dto.ActionRecommendation;
import com.workmydeal.backend.model.Deal;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class ActionRecommendationService {

    public ActionRecommendation recommendAction(
            Deal deal
    ) {

        String stage =
                deal.getStage() == null
                ?
                ""
                :
                deal.getStage().toUpperCase();

        String lifecycle =
                deal.getLifecycleState() == null
                ?
                "ACTIVE"
                :
                deal.getLifecycleState().toUpperCase();

        if (
            lifecycle.equals(
                    "DORMANT"
            )
        ) {

            return new ActionRecommendation(

                    "Relationship Touch",

                    "Opportunity is dormant and should return to light nurture.",

                    "I had a thought and wanted to reconnect. Has anything changed on timing or priorities since we last spoke?",

                    "RULE_BASED"

            );

        }

        if (
            stage.contains(
                    "PROPOSAL"
            )
        ) {

            return new ActionRecommendation(

                    "Proposal Follow-Up",

                    "Proposal opportunities require momentum maintenance.",

                    "I had a thought after sending the proposal. Was there anything that stood out or anything we should adjust together?",

                    "RULE_BASED"

            );

        }

        if (
            stage.contains(
                    "NEGOTIATION"
            )
            ||
            stage.contains(
                    "VERBAL"
            )
        ) {

            return new ActionRecommendation(

                    "Decision Review",

                    "Late-stage opportunity needs active engagement.",

                    "Wanted to reconnect because it feels like we may be close. Is there anything still preventing a decision?",

                    "RULE_BASED"

            );

        }

        if (
            deal.getExpectedCloseDate()
            != null
        ) {

            long daysRemaining =
                    ChronoUnit.DAYS.between(
                            LocalDate.now(),
                            deal.getExpectedCloseDate()
                    );

            if (
                daysRemaining <= 14
            ) {

                return new ActionRecommendation(

                        "Close Date Review",

                        "Expected close date is approaching.",

                        "I wanted to reconnect because timing is getting closer. Is everything still lining up as expected?",

                        "RULE_BASED"

                );

            }

        }

        return new ActionRecommendation(

                "Discovery Follow-Up",

                "Default recommendation applied.",

                "I had a thought and wanted to check in. Has anything changed that would help us move forward?",

                "RULE_BASED"

        );

    }

}