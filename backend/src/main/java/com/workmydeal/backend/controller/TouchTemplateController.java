package com.workmydeal.backend.controller;

import com.workmydeal.backend.model.TouchTemplate;
import com.workmydeal.backend.service.TouchTemplateService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/touch-templates")
public class TouchTemplateController {

    private final TouchTemplateService touchTemplateService;

    public TouchTemplateController(TouchTemplateService touchTemplateService) {
        this.touchTemplateService = touchTemplateService;
    }

    @GetMapping
    public List<TouchTemplate> getAllTemplates() {
        return touchTemplateService.getAllTemplates();
    }

    @PostMapping
    public TouchTemplate createTemplate(@RequestBody TouchTemplate template) {
        return touchTemplateService.createTemplate(template);
    }

    @PutMapping("/{id}")
    public TouchTemplate updateTemplate(
            @PathVariable Long id,
            @RequestBody TouchTemplate template
    ) {
        return touchTemplateService.updateTemplate(id, template);
    }
}
