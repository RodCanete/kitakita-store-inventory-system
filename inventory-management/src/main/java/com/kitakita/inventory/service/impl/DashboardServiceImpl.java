package com.kitakita.inventory.service.impl;

import com.kitakita.inventory.dto.response.DashboardSummaryResponse;
import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.repository.ProductRepository;
import com.kitakita.inventory.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        List<Product> products = productRepository.findAll();

        DashboardSummaryResponse.SummaryCards cards = buildSummaryCards(products);
        List<DashboardSummaryResponse.ChartPoint> inventoryByCategory = buildInventoryByCategory(products);
        List<DashboardSummaryResponse.ChartPoint> stockMovement = buildStockMovement(products);
        List<DashboardSummaryResponse.ProductSnapshot> topSelling = buildTopProducts(products);
        List<DashboardSummaryResponse.ProductSnapshot> lowStock = buildLowStockProducts(products);

        return DashboardSummaryResponse.builder()
                .summaryCards(cards)
                .inventoryByCategory(inventoryByCategory)
                .stockMovement(stockMovement)
                .topSellingStock(topSelling)
                .lowQuantityStock(lowStock)
                .build();
    }

    private DashboardSummaryResponse.SummaryCards buildSummaryCards(List<Product> products) {
        long totalProducts = products.size();
        long totalCategories = products.stream()
                .map(product -> product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .filter(id -> id != null)
                .distinct()
                .count();
        long totalSuppliers = products.stream()
                .map(product -> product.getSupplier() != null ? product.getSupplier().getSupplierId() : null)
                .filter(id -> id != null)
                .distinct()
                .count();

        long totalQuantity = products.stream()
                .mapToLong(p -> p.getQuantity() != null ? p.getQuantity() : 0)
                .sum();

        long onTheWay = products.stream()
                .mapToLong(p -> p.getOnTheWay() != null ? p.getOnTheWay() : 0)
                .sum();

        long lowStockCount = products.stream()
                .filter(p -> p.getQuantity() != null && p.getThresholdValue() != null)
                .filter(p -> p.getQuantity() <= p.getThresholdValue())
                .count();

        BigDecimal inventoryValue = products.stream()
                .filter(p -> p.getSellingPrice() != null && p.getQuantity() != null)
                .map(p -> p.getSellingPrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        return DashboardSummaryResponse.SummaryCards.builder()
                .totalProducts(totalProducts)
                .totalCategories(totalCategories)
                .totalSuppliers(totalSuppliers)
                .lowStockCount(lowStockCount)
                .onTheWay(onTheWay)
                .totalQuantity(totalQuantity)
                .inventoryValue(inventoryValue)
                .build();
    }

    private List<DashboardSummaryResponse.ChartPoint> buildInventoryByCategory(List<Product> products) {
        Map<String, Integer> grouped = products.stream()
                .collect(Collectors.groupingBy(
                        product -> product.getCategory() != null ? product.getCategory().getCategoryName() : "Uncategorized",
                        Collectors.summingInt(p -> p.getQuantity() != null ? p.getQuantity() : 0)
                ));

        if (grouped.isEmpty()) {
            return List.of(
                    DashboardSummaryResponse.ChartPoint.builder().label("No Data").value(0).build()
            );
        }

        return grouped.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(6)
                .map(entry -> DashboardSummaryResponse.ChartPoint.builder()
                        .label(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<DashboardSummaryResponse.ChartPoint> buildStockMovement(List<Product> products) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);
        Map<java.time.LocalDate, Integer> grouped = new java.util.TreeMap<>();

        products.forEach(product -> {
            LocalDateTime reference = product.getUpdatedAt() != null ? product.getUpdatedAt() : product.getCreatedAt();
            if (reference == null) {
                reference = LocalDateTime.now();
            }
            java.time.LocalDate monthBucket = reference.toLocalDate().withDayOfMonth(1);
            grouped.merge(monthBucket, product.getQuantity() != null ? product.getQuantity() : 0, Integer::sum);
        });

        if (grouped.isEmpty()) {
            return List.of(DashboardSummaryResponse.ChartPoint.builder()
                    .label("No Data")
                    .value(0)
                    .build());
        }

        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> DashboardSummaryResponse.ChartPoint.builder()
                        .label(entry.getKey().format(formatter))
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<DashboardSummaryResponse.ProductSnapshot> buildTopProducts(List<Product> products) {
        return products.stream()
                .sorted(Comparator.comparing(Product::getQuantity, Comparator.nullsLast(Integer::compareTo)).reversed())
                .limit(5)
                .map(this::toSnapshot)
                .collect(Collectors.toList());
    }

    private List<DashboardSummaryResponse.ProductSnapshot> buildLowStockProducts(List<Product> products) {
        return products.stream()
                .filter(p -> p.getThresholdValue() != null && p.getQuantity() != null
                        && p.getQuantity() <= p.getThresholdValue())
                .sorted(Comparator.comparing(Product::getQuantity, Comparator.nullsLast(Integer::compareTo)))
                .limit(5)
                .map(this::toSnapshot)
                .collect(Collectors.toList());
    }

    private DashboardSummaryResponse.ProductSnapshot toSnapshot(Product product) {
        return DashboardSummaryResponse.ProductSnapshot.builder()
                .productId(product.getProductId())
                .name(product.getProductName())
                .quantity(product.getQuantity())
                .thresholdValue(product.getThresholdValue())
                .unit(product.getUnit())
                .build();
    }
}

