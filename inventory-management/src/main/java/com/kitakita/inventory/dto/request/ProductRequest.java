package com.kitakita.inventory.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String productName;

    private String productCode;

    @NotNull(message = "Category is required")
    private Integer categoryId;

    private Integer supplierId;

    @NotNull(message = "Buying price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Buying price must be greater than zero")
    private BigDecimal buyingPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than zero")
    private BigDecimal sellingPrice;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Threshold value is required")
    @Min(value = 0, message = "Threshold value cannot be negative")
    private Integer thresholdValue;

    @NotNull(message = "Opening stock is required")
    @Min(value = 0, message = "Opening stock cannot be negative")
    private Integer openingStock;

    @NotNull(message = "On the way quantity is required")
    @Min(value = 0, message = "On the way quantity cannot be negative")
    private Integer onTheWay;

    private LocalDate expiryDate;

    private String imageUrl;

    private Boolean isActive = true;
}


