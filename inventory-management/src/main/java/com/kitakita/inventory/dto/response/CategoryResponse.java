package com.kitakita.inventory.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CategoryResponse {
    
    private Integer categoryId;
    
    private String categoryName;
    
    private String description;
    
    private LocalDateTime createdAt;
}