package com.kitakita.inventory.service;

import com.kitakita.inventory.dto.request.PurchaseRequest;
import com.kitakita.inventory.dto.response.PurchaseHistoryResponse;

public interface PurchaseService {
    PurchaseHistoryResponse createPurchase(PurchaseRequest request);
}