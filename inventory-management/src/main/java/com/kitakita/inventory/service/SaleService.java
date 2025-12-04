package com.kitakita.inventory.service;

import com.kitakita.inventory.dto.request.SaleRequest;
import com.kitakita.inventory.dto.response.PagedResponse;
import com.kitakita.inventory.dto.response.SaleResponse;
import com.kitakita.inventory.dto.response.SalesSummaryResponse;

public interface SaleService {
    PagedResponse<SaleResponse> getSales(String search, int page, int size);
    SaleResponse createSale(SaleRequest request);
    SaleResponse getSaleById(Integer id);
    void deleteSale(Integer id);
    SalesSummaryResponse getSalesSummary();
}