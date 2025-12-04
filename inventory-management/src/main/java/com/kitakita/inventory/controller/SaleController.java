package com.kitakita.inventory.controller;

import com.kitakita.inventory.dto.request.SaleRequest;
import com.kitakita.inventory.dto.response.PagedResponse;
import com.kitakita.inventory.dto.response.SaleResponse;
import com.kitakita.inventory.dto.response.SalesSummaryResponse;
import com.kitakita.inventory.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<PagedResponse<SaleResponse>> getSales(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<SaleResponse> response = saleService.getSales(search, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<SaleResponse> createSale(@RequestBody SaleRequest request) {
        SaleResponse response = saleService.createSale(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> getSaleById(@PathVariable Integer id) {
        SaleResponse response = saleService.getSaleById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Integer id) {
        saleService.deleteSale(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<SalesSummaryResponse> getSalesSummary() {
        SalesSummaryResponse response = saleService.getSalesSummary();
        return ResponseEntity.ok(response);
    }
}