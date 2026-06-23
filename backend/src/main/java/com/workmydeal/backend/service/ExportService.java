package com.workmydeal.backend.service;

import com.workmydeal.backend.model.Deal;
import com.workmydeal.backend.repository.DealRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    private final DealRepository dealRepository;

    public ExportService(DealRepository dealRepository) {
        this.dealRepository = dealRepository;
    }

    public byte[] exportPipelineReport() throws Exception {

        List<Deal> deals =
                dealRepository.findAll();

        Workbook workbook =
                new XSSFWorkbook();

        Sheet sheet =
                workbook.createSheet("Pipeline Report");

        Row header =
                sheet.createRow(0);

        header.createCell(0).setCellValue("Deal Name");
        header.createCell(1).setCellValue("Company");
        header.createCell(2).setCellValue("Value");
        header.createCell(3).setCellValue("Probability");
        header.createCell(4).setCellValue("Stage");
        header.createCell(5).setCellValue("Status");

        int rowNumber = 1;

        for (Deal deal : deals) {

            Row row =
                    sheet.createRow(rowNumber++);

            row.createCell(0)
                    .setCellValue(deal.getDealName());

            row.createCell(1)
                    .setCellValue(deal.getCompanyName());

            row.createCell(2)
                    .setCellValue(
                            deal.getDealValue() != null
                                    ? deal.getDealValue().doubleValue()
                                    : 0
                    );

            row.createCell(3)
                    .setCellValue(
                            deal.getProbability() != null
                                    ? deal.getProbability()
                                    : 0
                    );

            row.createCell(4)
                    .setCellValue(deal.getStage());

            row.createCell(5)
                    .setCellValue(deal.getDealStatus());
        }

        ByteArrayOutputStream output =
                new ByteArrayOutputStream();

        workbook.write(output);
        workbook.close();

        return output.toByteArray();
    }
}