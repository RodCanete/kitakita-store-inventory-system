package com.kitakita.inventory.service.impl;

import com.kitakita.inventory.dto.request.SaleRequest;
import com.kitakita.inventory.dto.response.PagedResponse;
import com.kitakita.inventory.dto.response.SaleResponse;
import com.kitakita.inventory.dto.response.SalesSummaryResponse;
import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.entity.Sale;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.ProductRepository;
import com.kitakita.inventory.repository.SaleRepository;
import com.kitakita.inventory.security.SecurityUtils;
import com.kitakita.inventory.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SaleResponse> getSales(String search, int page, int size) {
        User currentUser = securityUtils.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);

        Page<Sale> salePage;
        if (StringUtils.hasText(search)) {
            search = search.trim().toLowerCase();
            salePage = saleRepository.findByUserAndSearch(currentUser, search, pageable);
        } else {
            salePage = saleRepository.findByUser(currentUser, pageable);
        }

        return PagedResponse.<SaleResponse>builder()
                .content(salePage.getContent().stream().map(this::mapToResponse).toList())
                .totalElements(salePage.getTotalElements())
                .totalPages(salePage.getTotalPages())
                .page(salePage.getNumber())
                .size(salePage.getSize())
                .hasNext(salePage.hasNext())
                .hasPrevious(salePage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public SaleResponse createSale(SaleRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        
        // Get the product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Check if product belongs to current user
        if (!product.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        // Check if there's enough stock
        if (product.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getProductName());
        }
        
        // Generate unique sale code
        String saleCode = generateSaleCode();
        
        // Create sale
        Sale sale = Sale.builder()
                .saleCode(saleCode)
                .product(product)
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .totalValue(request.getTotalValue())
                .buyingPrice(request.getBuyingPrice())
                .user(currentUser)
                .notes(request.getNotes())
                .build();
        
        // Update product quantity
        product.setQuantity(product.getQuantity() - request.getQuantity());
        productRepository.save(product);
        
        Sale saved = saleRepository.save(sale);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Integer id) {
        User currentUser = securityUtils.getCurrentUser();
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        
        // Check if sale belongs to current user
        if (!sale.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Sale not found");
        }
        
        return mapToResponse(sale);
    }

    @Override
    @Transactional
    public SaleResponse updateSale(Integer id, SaleRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        
        // Check if sale belongs to current user
        if (!sale.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Sale not found");
        }
        
        // Get the product
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Check if product belongs to current user
        if (!product.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        // Calculate quantity difference
        int quantityDifference = request.getQuantity() - sale.getQuantity();
        
        // If changing product, restore old product quantity and check new product stock
        if (!sale.getProduct().getProductId().equals(request.getProductId())) {
            // Restore old product quantity
            Product oldProduct = sale.getProduct();
            oldProduct.setQuantity(oldProduct.getQuantity() + sale.getQuantity());
            productRepository.save(oldProduct);
            
            // Check if new product has enough stock
            if (product.getQuantity() < request.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getProductName());
            }
            
            // Deduct from new product
            product.setQuantity(product.getQuantity() - request.getQuantity());
        } else {
            // Same product - adjust quantity
            int newProductQuantity = product.getQuantity() + quantityDifference;
            if (newProductQuantity < 0) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getProductName());
            }
            product.setQuantity(newProductQuantity);
        }
        
        productRepository.save(product);
        
        // Update sale
        sale.setProduct(product);
        sale.setQuantity(request.getQuantity());
        sale.setUnitPrice(request.getUnitPrice());
        sale.setTotalValue(request.getTotalValue());
        sale.setBuyingPrice(request.getBuyingPrice());
        sale.setNotes(request.getNotes());
        
        Sale updated = saleRepository.save(sale);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSale(Integer id) {
        User currentUser = securityUtils.getCurrentUser();
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        
        // Check if sale belongs to current user
        if (!sale.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Sale not found");
        }
        
        // Restore product quantity
        Product product = sale.getProduct();
        product.setQuantity(product.getQuantity() + sale.getQuantity());
        productRepository.save(product);
        
        saleRepository.delete(sale);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesSummaryResponse getSalesSummary() {
        User currentUser = securityUtils.getCurrentUser();
        
        BigDecimal totalSalesValue = saleRepository.getTotalSalesValue(currentUser);
        Long totalSalesCount = saleRepository.getTotalSalesCount(currentUser);
        Long totalProductsSold = saleRepository.getTotalProductsSold(currentUser);
        
        // Handle null values
        if (totalSalesValue == null) totalSalesValue = BigDecimal.ZERO;
        if (totalSalesCount == null) totalSalesCount = 0L;
        if (totalProductsSold == null) totalProductsSold = 0L;
        
        return SalesSummaryResponse.builder()
                .totalSalesValue(totalSalesValue)
                .totalSalesCount(totalSalesCount)
                .totalProductsSold(totalProductsSold)
                .build();
    }

    private SaleResponse mapToResponse(Sale sale) {
        return SaleResponse.builder()
                .saleId(sale.getSaleId())
                .saleCode(sale.getSaleCode())
                .productId(sale.getProduct().getProductId())
                .productName(sale.getProduct().getProductName())
                .quantity(sale.getQuantity())
                .unitPrice(sale.getUnitPrice())
                .totalValue(sale.getTotalValue())
                .buyingPrice(sale.getBuyingPrice())
                .saleDate(sale.getSaleDate())
                .notes(sale.getNotes())
                .build();
    }
    
    private String generateSaleCode() {
        return "SL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}