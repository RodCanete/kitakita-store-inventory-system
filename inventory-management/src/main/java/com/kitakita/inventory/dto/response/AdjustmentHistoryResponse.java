package com.kitakita.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdjustmentHistoryResponse {
    private Integer adjustmentId;
    private Integer productId;
    private String productName;
    private String adjustmentType;
    private Integer quantity;
    private String reason;
    private String performedBy;
    private LocalDateTime adjustmentDate;
}