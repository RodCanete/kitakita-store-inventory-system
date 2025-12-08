package com.kitakita.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ReportsResponse {
    
    private SalesOverview salesOverview;
    private List<CategoryPerformance> bestSellingCategories;
    private List<ProductPerformance> bestSellingProducts;
    private List<ProfitRevenueData> profitRevenueData;
    
    @Data
    @Builder
    public static class SalesOverview {
        private BigDecimal totalProfit;
        private BigDecimal revenue;
        private BigDecimal sales;
        private BigDecimal netPurchaseValue;
        private BigDecimal netSalesValue;
        private BigDecimal momProfit;
        private BigDecimal yoyProfit;
    }
    
    @Data
    @Builder
    public static class CategoryPerformance {
        private String category;
        private BigDecimal turnOver;
        private Double increaseBy;
    }
    
    @Data
    @Builder
    public static class ProductPerformance {
        private String product;
        private Integer productId;
        private String category;
        private String remainingQuantity;
        private BigDecimal turnOver;
        private Double increaseBy;
    }
    
    @Data
    @Builder
    public static class ProfitRevenueData {
        private String month;
        private BigDecimal revenue;
        private BigDecimal profit;
    }
}