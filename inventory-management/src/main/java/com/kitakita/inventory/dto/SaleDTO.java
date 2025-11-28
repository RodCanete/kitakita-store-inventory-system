package com.kitakita.inventory.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleDTO {
    private Integer saleId;
    private String saleCode;
    private ProductDTO product;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalValue;
    private BigDecimal buyingPrice;
    private LocalDateTime saleDate;
    private String notes;
    
    // Nested DTO for product information
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductDTO {
        private Integer productId;
        private String productName;
        private String productCode;
        private String unit;
        private BigDecimal buyingPrice;
        private BigDecimal sellingPrice;
    }
}