package com.kitakita.inventory.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {
    private String supplierName;
    private String contactNumber;
    private String email;
    private String address;
    private Boolean isActive;
}