package com.kitakita.inventory.service;

import com.kitakita.inventory.dto.request.ProductRequest;
import com.kitakita.inventory.dto.response.PagedResponse;
import com.kitakita.inventory.dto.response.ProductReferenceDataResponse;
import com.kitakita.inventory.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    PagedResponse<ProductResponse> getProducts(String search, Integer categoryId, Pageable pageable);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Integer productId, ProductRequest request);
    void deleteProduct(Integer productId);
    byte[] exportInventoryPdf(String search, Integer categoryId);
    ProductReferenceDataResponse getReferenceData();
}

