package com.kitakita.inventory.service;

import com.kitakita.inventory.dto.request.SupplierRequest;
import com.kitakita.inventory.dto.response.PagedResponse;
import com.kitakita.inventory.dto.response.SupplierResponse;

public interface SupplierService {
    PagedResponse<SupplierResponse> getSuppliers(String search, int page, int size);
    SupplierResponse createSupplier(SupplierRequest request);
    SupplierResponse updateSupplier(Integer id, SupplierRequest request);
    void deleteSupplier(Integer id);
}