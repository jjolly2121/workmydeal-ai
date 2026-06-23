package com.workmydeal.backend.service;

import com.workmydeal.backend.model.TouchTemplate;
import com.workmydeal.backend.repository.TouchTemplateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TouchTemplateService {

    private final TouchTemplateRepository touchTemplateRepository;
    private final AuditHistoryService auditHistoryService;

    public TouchTemplateService(
            TouchTemplateRepository touchTemplateRepository,
            AuditHistoryService auditHistoryService
    ) {
        this.touchTemplateRepository = touchTemplateRepository;
        this.auditHistoryService = auditHistoryService;
    }

    public List<TouchTemplate> getAllTemplates() {
        return touchTemplateRepository.findAll();
    }

    public TouchTemplate createTemplate(TouchTemplate template) {
        TouchTemplate savedTemplate = touchTemplateRepository.save(template);

        auditHistoryService.record(
                "CREATE",
                "TOUCH_TEMPLATE",
                savedTemplate.getId(),
                "SYSTEM",
                "Touch template created: " + savedTemplate.getTouchCategory()
        );

        return savedTemplate;
    }

    public TouchTemplate updateTemplate(Long id, TouchTemplate updatedTemplate) {
        TouchTemplate existingTemplate = touchTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Touch template not found with id: " + id));

        existingTemplate.setTouchCategory(updatedTemplate.getTouchCategory());
        existingTemplate.setExampleMessage(updatedTemplate.getExampleMessage());
        existingTemplate.setDefaultFrequency(updatedTemplate.getDefaultFrequency());
        existingTemplate.setActiveStatus(updatedTemplate.getActiveStatus());

        TouchTemplate savedTemplate = touchTemplateRepository.save(existingTemplate);

        auditHistoryService.record(
                "UPDATE",
                "TOUCH_TEMPLATE",
                id,
                "SYSTEM",
                "Touch template updated: " + savedTemplate.getTouchCategory()
        );

        return savedTemplate;
    }
}
