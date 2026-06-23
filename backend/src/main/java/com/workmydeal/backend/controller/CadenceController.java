package com.workmydeal.backend.controller;

import com.workmydeal.backend.model.Cadence;
import com.workmydeal.backend.service.CadenceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cadences")
public class CadenceController {

    private final CadenceService cadenceService;

    public CadenceController(CadenceService cadenceService) {
        this.cadenceService = cadenceService;
    }

    @GetMapping
    public List<Cadence> getAllCadences() {
        return cadenceService.getAllCadences();
    }

    @PostMapping
    public Cadence createCadence(@RequestBody Cadence cadence) {
        return cadenceService.createCadence(cadence);
    }

    @PutMapping("/{id}")
    public Cadence updateCadence(
            @PathVariable Long id,
            @RequestBody Cadence updatedCadence
    ) {
        return cadenceService.updateCadence(id, updatedCadence);
    }
}