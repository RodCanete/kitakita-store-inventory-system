package com.kitakita.inventory.service.impl;

import com.kitakita.inventory.dto.response.ReportsResponse;
import com.kitakita.inventory.entity.Category;
import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.entity.Sale;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.repository.CategoryRepository;
import com.kitakita.inventory.repository.ProductRepository;
import com.kitakita.inventory.repository.SaleRepository;
import com.kitakita.inventory.security.SecurityUtils;
import com.kitakita.inventory.service.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportsServiceImpl implements ReportsService {
    
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;
    
    @Override
    public ReportsResponse getReportsData() {
        User currentUser = securityUtils.getCurrentUser();
        
        // Build the response with dynamic data
        ReportsResponse.SalesOverview salesOverview = buildSalesOverview(currentUser);
        List<ReportsResponse.CategoryPerformance> categories = buildBestSellingCategories(currentUser);
        List<ReportsResponse.ProductPerformance> products = buildBestSellingProducts(currentUser);
        List<ReportsResponse.ProfitRevenueData> profitRevenue = buildProfitRevenueData(currentUser);
        
        return ReportsResponse.builder()
                .salesOverview(salesOverview)
                .bestSellingCategories(categories)
                .bestSellingProducts(products)
                .profitRevenueData(profitRevenue)
                .build();
    }
    
    private ReportsResponse.SalesOverview buildSalesOverview(User user) {
        // Get real data from the database
        BigDecimal totalSalesValue = saleRepository.getTotalSalesValue(user);
        Long totalSalesCount = saleRepository.getTotalSalesCount(user);
        Long totalProductsSold = saleRepository.getTotalProductsSold(user);
        
        // Also get product data
        Long totalProducts = productRepository.count();
        Long lowStockCount = productRepository.getLowStockCount(user);
        BigDecimal inventoryValue = productRepository.getInventoryValue(user);
        Long totalQuantity = productRepository.getTotalQuantity(user);
        
        // Handle null values
        if (totalSalesValue == null) totalSalesValue = BigDecimal.ZERO;
        if (totalSalesCount == null) totalSalesCount = 0L;
        if (totalProductsSold == null) totalProductsSold = 0L;
        if (totalProducts == null) totalProducts = 0L;
        if (lowStockCount == null) lowStockCount = 0L;
        if (inventoryValue == null) inventoryValue = BigDecimal.ZERO;
        if (totalQuantity == null) totalQuantity = 0L;
        
        // Calculate derived values based on real data
        BigDecimal totalProfit = totalSalesValue.subtract(inventoryValue.multiply(BigDecimal.valueOf(0.7))); // Simplified profit calculation
        BigDecimal revenue = totalSalesValue;
        BigDecimal sales = totalSalesValue;
        BigDecimal netPurchaseValue = inventoryValue; // Simplified
        BigDecimal netSalesValue = totalSalesValue;
        BigDecimal momProfit = totalProfit.multiply(BigDecimal.valueOf(1.05)); // 5% increase assumption
        BigDecimal yoyProfit = totalProfit.multiply(BigDecimal.valueOf(1.2)); // 20% increase assumption
        
        return ReportsResponse.SalesOverview.builder()
                .totalProfit(totalProfit)
                .revenue(revenue)
                .sales(sales)
                .netPurchaseValue(netPurchaseValue)
                .netSalesValue(netSalesValue)
                .momProfit(momProfit)
                .yoyProfit(yoyProfit)
                .build();
    }
    
    private List<ReportsResponse.CategoryPerformance> buildBestSellingCategories(User user) {
        List<ReportsResponse.CategoryPerformance> categories = new ArrayList<>();
        
        // Get real sales data grouped by category
        Pageable pageable = PageRequest.of(0, 1000); // Get all sales
        List<Sale> allSales = saleRepository.findByUser(user, pageable).getContent();
        
        // Group sales by category and calculate turnover
        Map<Category, BigDecimal> categoryTurnover = allSales.stream()
                .collect(Collectors.groupingBy(
                        sale -> sale.getProduct().getCategory(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Sale::getTotalValue,
                                BigDecimal::add
                        )
                ));
        
        // Sort by turnover and take top 3
        categoryTurnover.entrySet().stream()
                .sorted(Map.Entry.<Category, BigDecimal>comparingByValue().reversed())
                .limit(3)
                .forEach(entry -> {
                    Category category = entry.getKey();
                    BigDecimal turnover = entry.getValue();
                    if (category != null && turnover != null) {
                        categories.add(ReportsResponse.CategoryPerformance.builder()
                                .category(category.getCategoryName())
                                .turnOver(turnover)
                                .increaseBy(5.0 + Math.random() * 10) // Random increase for demo purposes
                                .build());
                    }
                });
        
        return categories;
    }
    
    private List<ReportsResponse.ProductPerformance> buildBestSellingProducts(User user) {
        List<ReportsResponse.ProductPerformance> products = new ArrayList<>();
        
        // Get real sales data
        Pageable pageable = PageRequest.of(0, 1000); // Get all sales
        List<Sale> allSales = saleRepository.findByUser(user, pageable).getContent();
        
        // Group sales by product and calculate turnover
        Map<Product, BigDecimal> productTurnover = allSales.stream()
                .collect(Collectors.groupingBy(
                        Sale::getProduct,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                Sale::getTotalValue,
                                BigDecimal::add
                        )
                ));
        
        // Sort by turnover and take top 6
        productTurnover.entrySet().stream()
                .sorted(Map.Entry.<Product, BigDecimal>comparingByValue().reversed())
                .limit(6)
                .forEach(entry -> {
                    Product product = entry.getKey();
                    BigDecimal turnover = entry.getValue();
                    if (product != null && turnover != null) {
                        products.add(ReportsResponse.ProductPerformance.builder()
                                .product(product.getProductName())
                                .productId(product.getProductId())
                                .category(product.getCategory() != null ? product.getCategory().getCategoryName() : "Unknown")
                                .remainingQuantity(product.getQuantity() + " " + product.getUnit())
                                .turnOver(turnover)
                                .increaseBy(3.0 + Math.random() * 8) // Random increase for demo purposes
                                .build());
                    }
                });
        
        return products;
    }
    
    private List<ReportsResponse.ProfitRevenueData> buildProfitRevenueData(User user) {
        List<ReportsResponse.ProfitRevenueData> data = new ArrayList<>();
        
        // Get real sales data grouped by month
        Pageable pageable = PageRequest.of(0, 1000); // Get all sales
        List<Sale> allSales = saleRepository.findByUser(user, pageable).getContent();
        
        // Group sales by month and calculate revenue/profit
        Map<LocalDate, List<Sale>> salesByMonth = allSales.stream()
                .collect(Collectors.groupingBy(
                        sale -> sale.getSaleDate().withDayOfMonth(1).toLocalDate() // Group by first day of month
                ));
        
        // Generate data for the last 12 months
        LocalDate currentDate = LocalDate.now();
        
        for (int i = 11; i >= 0; i--) {
            LocalDate date = currentDate.minusMonths(i);
            String month = date.format(DateTimeFormatter.ofPattern("MMM"));
            
            // Get sales for this month
            List<Sale> monthlySales = salesByMonth.getOrDefault(date.withDayOfMonth(1), new ArrayList<>());
            
            // Calculate revenue and profit for this month
            BigDecimal revenue = monthlySales.stream()
                    .map(Sale::getTotalValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Simplified profit calculation
            BigDecimal profit = revenue.multiply(BigDecimal.valueOf(0.3)); // Assume 30% margin
            
            data.add(ReportsResponse.ProfitRevenueData.builder()
                    .month(month)
                    .revenue(revenue)
                    .profit(profit)
                    .build());
        }
        
        return data;
    }
}