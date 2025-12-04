package com.kitakita.inventory.service.impl;

import com.kitakita.inventory.dto.request.ProductRequest;
import com.kitakita.inventory.dto.response.PagedResponse;
import com.kitakita.inventory.dto.response.ProductReferenceDataResponse;
import com.kitakita.inventory.dto.response.ProductResponse;
import com.kitakita.inventory.entity.Category;
import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.entity.Supplier;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.CategoryRepository;
import com.kitakita.inventory.repository.ProductRepository;
import com.kitakita.inventory.repository.SupplierRepository;
import com.kitakita.inventory.repository.UserRepository;
import com.kitakita.inventory.service.ProductService;
import com.kitakita.inventory.security.SecurityUtils;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProducts(String search, Integer categoryId, Pageable pageable) {
        User currentUser = securityUtils.getCurrentUser();
        Page<Product> productPage = productRepository.searchProducts(
                currentUser,
                normalize(search),
                categoryId,
                pageable
        );

        return PagedResponse.<ProductResponse>builder()
                .content(productPage.getContent().stream().map(this::mapToResponse).toList())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        }

        Product product = Product.builder()
                .productName(request.getProductName())
                .productCode(resolveProductCode(request.getProductCode()))
                .category(category)
                .supplier(supplier)
                .user(currentUser)
                .buyingPrice(request.getBuyingPrice())
                .sellingPrice(request.getSellingPrice())
                .unit(request.getUnit())
                .quantity(request.getQuantity())
                .thresholdValue(request.getThresholdValue())
                .openingStock(request.getOpeningStock())
                .onTheWay(request.getOnTheWay())
                .expiryDate(request.getExpiryDate())
                .imageUrl(request.getImageUrl())
                .isActive(Optional.ofNullable(request.getIsActive()).orElse(true))
                .build();

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Integer productId, ProductRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if the product belongs to the current user
        if (!existing.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Product not found");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        }

        existing.setProductName(request.getProductName());
        if (!StringUtils.hasText(existing.getProductCode())) {
            existing.setProductCode(resolveProductCode(request.getProductCode()));
        }
        existing.setCategory(category);
        existing.setSupplier(supplier);
        existing.setBuyingPrice(request.getBuyingPrice());
        existing.setSellingPrice(request.getSellingPrice());
        existing.setUnit(request.getUnit());
        existing.setQuantity(request.getQuantity());
        existing.setThresholdValue(request.getThresholdValue());
        existing.setOpeningStock(request.getOpeningStock());
        existing.setOnTheWay(request.getOnTheWay());
        existing.setExpiryDate(request.getExpiryDate());
        existing.setImageUrl(request.getImageUrl());
        existing.setIsActive(Optional.ofNullable(request.getIsActive()).orElse(existing.getIsActive()));

        Product updated = productRepository.save(existing);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Integer productId) {
        User currentUser = securityUtils.getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Check if the product belongs to the current user
        if (!product.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Product not found");
        }
        
        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportInventoryPdf(String search, Integer categoryId) {
        User currentUser = securityUtils.getCurrentUser();
        Page<Product> productPage = productRepository.searchProducts(
                currentUser,
                normalize(search),
                categoryId,
                Pageable.unpaged()
        );

        List<Product> products = productPage.getContent();
        return buildPdf(products);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReferenceDataResponse getReferenceData() {
        User currentUser = securityUtils.getCurrentUser();
        var categories = categoryRepository.findAll().stream()
                .map(category -> ProductReferenceDataResponse.Option.builder()
                        .id(category.getCategoryId())
                        .label(category.getCategoryName())
                        .build())
                .toList();

        var suppliers = supplierRepository.findByUser(currentUser).stream()
                .map(supplier -> ProductReferenceDataResponse.Option.builder()
                        .id(supplier.getSupplierId())
                        .label(supplier.getSupplierName())
                        .build())
                .toList();

        return ProductReferenceDataResponse.builder()
                .categories(categories)
                .suppliers(suppliers)
                .build();
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private ProductResponse mapToResponse(Product product) {
        Supplier supplier = product.getSupplier();
        Category category = product.getCategory();

        return ProductResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productCode(product.getProductCode())
                .categoryId(category != null ? category.getCategoryId() : null)
                .categoryName(category != null ? category.getCategoryName() : null)
                .supplierId(supplier != null ? supplier.getSupplierId() : null)
                .supplierName(supplier != null ? supplier.getSupplierName() : null)
                .buyingPrice(product.getBuyingPrice())
                .sellingPrice(product.getSellingPrice())
                .unit(product.getUnit())
                .quantity(product.getQuantity())
                .thresholdValue(product.getThresholdValue())
                .openingStock(product.getOpeningStock())
                .onTheWay(product.getOnTheWay())
                .expiryDate(product.getExpiryDate())
                .imageUrl(product.getImageUrl())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private byte[] buildPdf(List<Product> products) {
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            document.add(new Paragraph("KitaKita Inventory Report", titleFont));
            document.add(new Paragraph("Generated on: " + DateTimeFormatter.ISO_DATE.format(LocalDate.now())));
            document.add(new Paragraph("Total products: " + products.size()));
            document.add(new Paragraph(" "));
            
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 2f, 2f, 2f, 2f, 2f});
            
            addHeader(table, "Product");
            addHeader(table, "Code");
            addHeader(table, "Category");
            addHeader(table, "Quantity");
            addHeader(table, "Unit");
            addHeader(table, "Buying Price");
            addHeader(table, "Selling Price");
            
            products.forEach(product -> {
                table.addCell(nullable(product.getProductName()));
                table.addCell(nullable(product.getProductCode()));
                table.addCell(product.getCategory() != null ? product.getCategory().getCategoryName() : "-");
                table.addCell(nullable(product.getQuantity()));
                table.addCell(nullable(product.getUnit()));
                table.addCell(toCurrency(product.getBuyingPrice()));
                table.addCell(toCurrency(product.getSellingPrice()));
            });
            
            document.add(table);
        } catch (DocumentException e) {
            throw new IllegalStateException("Failed to generate PDF", e);
        } finally {
            document.close();
        }
        
        return baos.toByteArray();
    }
    
    private void addHeader(PdfPTable table, String text) {
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        PdfPCell headerCell = new PdfPCell(new Paragraph(text, headerFont));
        table.addCell(headerCell);
    }
    
    private String nullable(Object value) {
        return Objects.toString(value, "-");
    }
    
    private String toCurrency(BigDecimal value) {
        if (value == null) {
            return "-";
        }
        return "₱" + value;
    }

    private String resolveProductCode(String requestedCode) {
        String candidate = StringUtils.hasText(requestedCode)
                ? requestedCode.trim()
                : generateProductCode();

        while (productRepository.existsByProductCode(candidate)) {
            candidate = generateProductCode();
        }
        return candidate;
    }

    private String generateProductCode() {
        return "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}