package com.kitakita.inventory.service.impl;

import com.kitakita.inventory.dto.request.PurchaseRequest;
import com.kitakita.inventory.dto.response.PurchaseHistoryResponse;
import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.entity.Purchase;
import com.kitakita.inventory.entity.Supplier;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.repository.ProductRepository;
import com.kitakita.inventory.repository.PurchaseRepository;
import com.kitakita.inventory.repository.SupplierRepository;
import com.kitakita.inventory.security.SecurityUtils;
import com.kitakita.inventory.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class PurchaseServiceImpl implements PurchaseService {
    
    @Autowired
    private PurchaseRepository purchaseRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @Autowired
    private SecurityUtils securityUtils;
    
    @Override
    @Transactional
    public PurchaseHistoryResponse createPurchase(PurchaseRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        
        // Verify the product belongs to the current user
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
                
        if (!product.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Product not found or access denied");
        }
        
        // If supplier is provided, verify it belongs to the current user
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
                    
            if (!supplier.getUser().getUserId().equals(currentUser.getUserId())) {
                throw new RuntimeException("Supplier not found or access denied");
            }
        }
        
        // Calculate total cost
        BigDecimal totalCost = request.getUnitCost().multiply(BigDecimal.valueOf(request.getQuantity()));
        
        // Create the purchase
        Purchase purchase = Purchase.builder()
                .product(product)
                .supplier(supplier)
                .quantity(request.getQuantity())
                .unitCost(request.getUnitCost())
                .totalCost(totalCost)
                .notes(request.getNotes())
                .status(Purchase.PurchaseStatus.COMPLETED)
                .purchaseDate(LocalDateTime.now()) // Explicitly set the purchase date
                .build();
        
        Purchase savedPurchase = purchaseRepository.save(purchase);
        
        // Update product quantities
        // When adding a purchase, we typically increase:
        // 1. The remaining stock (quantity)
        // 2. The opening stock (as this represents total inventory ever purchased)
        // 3. On the way stock is not affected by completed purchases
        
        int newQuantity = product.getQuantity() + request.getQuantity();
        int newOpeningStock = product.getOpeningStock() + request.getQuantity();
        
        product.setQuantity(newQuantity);
        product.setOpeningStock(newOpeningStock);
        // Note: onTheWay is not updated as this represents pending shipments, not completed purchases
        
        productRepository.save(product);
        
        // Map to response
        return PurchaseHistoryResponse.builder()
                .purchaseId(savedPurchase.getPurchaseId())
                .purchaseCode("PUR-" + String.format("%03d", savedPurchase.getPurchaseId()))
                .productId(savedPurchase.getProduct().getProductId())
                .productName(savedPurchase.getProduct().getProductName())
                .quantity(savedPurchase.getQuantity())
                .unitCost(savedPurchase.getUnitCost())
                .totalCost(savedPurchase.getTotalCost())
                .purchaseDate(savedPurchase.getPurchaseDate())
                .supplierName(supplier != null ? supplier.getSupplierName() : "N/A")
                .status(savedPurchase.getStatus().name())
                .build();
    }
}