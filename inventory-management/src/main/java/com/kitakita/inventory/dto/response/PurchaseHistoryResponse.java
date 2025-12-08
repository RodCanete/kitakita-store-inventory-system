package com.kitakita.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PurchaseHistoryResponse {
    private Integer purchaseId;
    private String purchaseCode;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private LocalDateTime purchaseDate;
    private String supplierName;
    private String status;
}