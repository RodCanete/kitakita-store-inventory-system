package com.kitakita.inventory.service;

import com.kitakita.inventory.dto.request.InventoryAdjustmentRequest;
import com.kitakita.inventory.dto.response.AdjustmentHistoryResponse;
import com.kitakita.inventory.dto.response.PurchaseHistoryResponse;

import java.util.List;

public interface ProductHistoryService {
    List<PurchaseHistoryResponse> getProductPurchases(Integer productId);
    List<AdjustmentHistoryResponse> getProductAdjustments(Integer productId);
    AdjustmentHistoryResponse createAdjustment(InventoryAdjustmentRequest request);
}
