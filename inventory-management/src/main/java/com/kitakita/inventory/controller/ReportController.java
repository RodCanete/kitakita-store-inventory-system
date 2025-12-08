package com.kitakita.inventory.controller;

import com.kitakita.inventory.dto.response.ReportsResponse;
import com.kitakita.inventory.service.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {
    
    private final ReportsService reportsService;
    
    @GetMapping
    public ReportsResponse getReports() {
        return reportsService.getReportsData();
    }
}