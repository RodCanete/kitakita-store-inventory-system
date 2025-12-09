package com.kitakita.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryAdjustmentRequest {

    @NotNull(message = "Product ID is required")
    private Integer productId;

    @NotBlank(message = "Adjustment type is required")
    private String adjustmentType; // Should be ADD, REMOVE, or CORRECTION

    @NotNull(message = "Quantity is required")
    private Integer quantity;

    private String reason;
}
