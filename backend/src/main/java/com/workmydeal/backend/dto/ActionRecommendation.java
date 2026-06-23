package com.workmydeal.backend.dto;

public class ActionRecommendation {

    private String recommendedAction;
    private String actionReason;
    private String suggestedMessage;
    private String recommendationSource;

    public ActionRecommendation() {
    }

    public ActionRecommendation(
            String recommendedAction,
            String actionReason,
            String suggestedMessage,
            String recommendationSource
    ) {
        this.recommendedAction = recommendedAction;
        this.actionReason = actionReason;
        this.suggestedMessage = suggestedMessage;
        this.recommendationSource = recommendationSource;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public String getActionReason() {
        return actionReason;
    }

    public void setActionReason(String actionReason) {
        this.actionReason = actionReason;
    }

    public String getSuggestedMessage() {
        return suggestedMessage;
    }

    public void setSuggestedMessage(String suggestedMessage) {
        this.suggestedMessage = suggestedMessage;
    }

    public String getRecommendationSource() {
        return recommendationSource;
    }

    public void setRecommendationSource(String recommendationSource) {
        this.recommendationSource = recommendationSource;
    }
}