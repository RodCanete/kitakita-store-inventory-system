package com.kitakita.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardSummaryResponse {

    private SummaryCards summaryCards;
    private List<ChartPoint> inventoryByCategory;
    private List<ChartPoint> stockMovement;
    private List<ProductSnapshot> topSellingStock;
    private List<ProductSnapshot> lowQuantityStock;

    @Data
    @Builder
    public static class SummaryCards {
        private long totalProducts;
        private long totalCategories;
        private long totalSuppliers;
        private long lowStockCount;
        private long onTheWay;
        private long totalQuantity;
        private BigDecimal inventoryValue;
    }

    @Data
    @Builder
    public static class ChartPoint {
        private String label;
        private Number value;
        private Number secondaryValue;
    }

    @Data
    @Builder
    public static class ProductSnapshot {
        private Integer productId;
        private String name;
        private Integer quantity;
        private Integer thresholdValue;
        private String unit;
    }
}


