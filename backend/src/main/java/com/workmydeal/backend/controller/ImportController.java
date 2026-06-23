package com.workmydeal.backend.controller;

import com.workmydeal.backend.dto.ImportResult;
import com.workmydeal.backend.service.ImportService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final ImportService importService;

    public ImportController(ImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/csv")
    public ImportResult importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("ownerId") Long ownerId,
            @RequestParam("ownerName") String ownerName
    ) throws Exception {
        return importService.importDeals(file, ownerId, ownerName);
    }
}
