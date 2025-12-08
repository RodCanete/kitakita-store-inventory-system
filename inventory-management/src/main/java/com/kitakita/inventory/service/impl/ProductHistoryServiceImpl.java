package com.kitakita.inventory.service.impl;

import com.kitakita.inventory.dto.response.AdjustmentHistoryResponse;
import com.kitakita.inventory.dto.response.PurchaseHistoryResponse;
import com.kitakita.inventory.entity.InventoryAdjustment;
import com.kitakita.inventory.entity.Purchase;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.repository.InventoryAdjustmentRepository;
import com.kitakita.inventory.repository.ProductRepository;
import com.kitakita.inventory.repository.PurchaseRepository;
import com.kitakita.inventory.security.SecurityUtils;
import com.kitakita.inventory.service.ProductHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductHistoryServiceImpl implements ProductHistoryService {
    
    private final PurchaseRepository purchaseRepository;
    private final InventoryAdjustmentRepository adjustmentRepository;
    private final ProductRepository productRepository;
    private final SecurityUtils securityUtils;
    
    @Override
    public List<PurchaseHistoryResponse> getProductPurchases(Integer productId) {
        User currentUser = securityUtils.getCurrentUser();
        
        // Verify the product belongs to the current user
        productRepository.findById(productId)
                .filter(product -> product.getUser().getUserId().equals(currentUser.getUserId()))
                .orElseThrow(() -> new RuntimeException("Product not found or access denied"));
        
        List<Purchase> purchases = purchaseRepository.findByUserAndProductId(currentUser, productId);
        
        return purchases.stream()
                .map(this::mapToPurchaseResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AdjustmentHistoryResponse> getProductAdjustments(Integer productId) {
        User currentUser = securityUtils.getCurrentUser();
        
        // Verify the product belongs to the current user
        productRepository.findById(productId)
                .filter(product -> product.getUser().getUserId().equals(currentUser.getUserId()))
                .orElseThrow(() -> new RuntimeException("Product not found or access denied"));
        
        List<InventoryAdjustment> adjustments = adjustmentRepository.findByUserAndProductId(currentUser, productId);
        
        return adjustments.stream()
                .map(this::mapToAdjustmentResponse)
                .collect(Collectors.toList());
    }
    
    private PurchaseHistoryResponse mapToPurchaseResponse(Purchase purchase) {
        return PurchaseHistoryResponse.builder()
                .purchaseId(purchase.getPurchaseId())
                .purchaseCode("PUR-" + String.format("%03d", purchase.getPurchaseId()))
                .productId(purchase.getProduct().getProductId())
                .productName(purchase.getProduct().getProductName())
                .quantity(purchase.getQuantity())
                .unitCost(purchase.getUnitCost())
                .totalCost(purchase.getTotalCost())
                .purchaseDate(purchase.getPurchaseDate())
                .supplierName(purchase.getSupplier() != null ? purchase.getSupplier().getSupplierName() : "N/A")
                .status(purchase.getStatus() != null ? purchase.getStatus().name() : "COMPLETED")
                .build();
    }
    
    private AdjustmentHistoryResponse mapToAdjustmentResponse(InventoryAdjustment adjustment) {
        return AdjustmentHistoryResponse.builder()
                .adjustmentId(adjustment.getAdjustmentId())
                .productId(adjustment.getProduct().getProductId())
                .productName(adjustment.getProduct().getProductName())
                .adjustmentType(adjustment.getAdjustmentType() != null ? adjustment.getAdjustmentType().name() : "CORRECTION")
                .quantity(adjustment.getQuantity())
                .reason(adjustment.getReason())
                .performedBy(adjustment.getAdjustedBy() != null ? adjustment.getAdjustedBy().getFullName() : "System")
                .adjustmentDate(adjustment.getAdjustmentDate())
                .build();
    }
}