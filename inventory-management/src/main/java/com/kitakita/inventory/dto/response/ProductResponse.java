package com.kitakita.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Integer productId;
    private String productName;
    private String productCode;
    private Integer categoryId;
    private String categoryName;
    private Integer supplierId;
    private String supplierName;
    private BigDecimal buyingPrice;
    private BigDecimal sellingPrice;
    private String unit;
    private Integer quantity;
    private Integer thresholdValue;
    private Integer openingStock;
    private Integer onTheWay;
    private LocalDate expiryDate;
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


