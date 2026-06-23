package com.workmydeal.backend.service;

import com.workmydeal.backend.dto.ImportResult;
import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.repository.DealRepository;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ImportService {

    private final DealRepository dealRepository;

    public ImportService(DealRepository dealRepository) {
        this.dealRepository = dealRepository;
    }

    public ImportResult importDeals(
            MultipartFile file,
            Long ownerId,
            String ownerName
    ) throws Exception {
        List<String[]> rows = getImportRows(file);

        if (rows.isEmpty()) {
            return new ImportResult(0, 0, 0);
        }

        int imported = 0;
        int skipped = 0;
        int errors = 0;

        // Start after the header row so import templates can label columns.
        for (int index = 1; index < rows.size(); index++) {
            String[] columns = rows.get(index);

            try {
                if (columns.length < 5) {
                    errors++;
                    continue;
                }

                String dealName = columns[0].trim();
                String companyName = columns[1].trim();

                boolean alreadyExists =
                        dealRepository.existsByDealNameAndCompanyName(
                                dealName,
                                companyName
                        );

                if (alreadyExists) {
                    skipped++;
                    continue;
                }

                Deal deal = new Deal();

                deal.setDealName(dealName);
                deal.setCompanyName(companyName);
                deal.setDealValue(new BigDecimal(columns[2].trim()));
                deal.setStage(columns[3].trim());
                deal.setProbability(Integer.parseInt(columns[4].trim()));

                deal.setDealStatus("ACTIVE");
                deal.setLifecycleState("ACTIVE");
                deal.setDealType("COMMERCIAL");
                deal.setOwner(ownerName);
                deal.setOwnerId(ownerId);
                deal.setContractStatus("NONE");

                dealRepository.save(deal);
                imported++;
            } catch (Exception exception) {
                errors++;
            }
        }

        return new ImportResult(imported, skipped, errors);
    }

    private List<String[]> getImportRows(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();

        if (filename != null && filename.toLowerCase().endsWith(".xlsx")) {
            return getExcelRows(file);
        }

        return getCsvRows(file);
    }

    private List<String[]> getCsvRows(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream())
        );

        String line;

        while ((line = reader.readLine()) != null) {
            rows.add(line.split(","));
        }

        return rows;
    }

    private List<String[]> getExcelRows(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            for (Row row : workbook.getSheetAt(0)) {
                rows.add(new String[] {
                        formatter.formatCellValue(row.getCell(0)),
                        formatter.formatCellValue(row.getCell(1)),
                        formatter.formatCellValue(row.getCell(2)),
                        formatter.formatCellValue(row.getCell(3)),
                        formatter.formatCellValue(row.getCell(4))
                });
            }
        }

        return rows;
    }
}
