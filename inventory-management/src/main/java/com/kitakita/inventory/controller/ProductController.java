package com.kitakita.inventory.controller;

import com.kitakita.inventory.dto.request.ProductRequest;
import com.kitakita.inventory.dto.request.InventoryAdjustmentRequest;
import com.kitakita.inventory.dto.request.PurchaseRequest;
import com.kitakita.inventory.dto.response.AdjustmentHistoryResponse;
import com.kitakita.inventory.dto.response.PagedResponse;
import com.kitakita.inventory.dto.response.ProductReferenceDataResponse;
import com.kitakita.inventory.dto.response.ProductResponse;
import com.kitakita.inventory.dto.response.PurchaseHistoryResponse;
import com.kitakita.inventory.service.ProductHistoryService;
import com.kitakita.inventory.service.ProductService;
import com.kitakita.inventory.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductHistoryService productHistoryService;
    
    @Autowired
    private PurchaseService purchaseService;

    @GetMapping
    public PagedResponse<ProductResponse> listProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "productName,asc") String sort
    ) {
        Pageable pageable = buildPageable(page, size, sort);
        return productService.getProducts(search, categoryId, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/{productId}")
    public ProductResponse updateProduct(@PathVariable Integer productId,
                                         @Valid @RequestBody ProductRequest request) {
        return productService.updateProduct(productId, request);
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Integer productId) {
        productService.deleteProduct(productId);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId
    ) {
        byte[] pdf = productService.exportInventoryPdf(search, categoryId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("kitakita-inventory.pdf").build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdf);
    }

    @GetMapping("/references")
    public ProductReferenceDataResponse getReferenceData() {
        return productService.getReferenceData();
    }

    @GetMapping("/{productId}/purchases")
    public List<PurchaseHistoryResponse> getProductPurchases(@PathVariable Integer productId) {
        return productHistoryService.getProductPurchases(productId);
    }

    @GetMapping("/{productId}/adjustments")
    public List<AdjustmentHistoryResponse> getProductAdjustments(@PathVariable Integer productId) {
        return productHistoryService.getProductAdjustments(productId);
    }

    @PostMapping("/{productId}/adjustments")
    public AdjustmentHistoryResponse createAdjustment(@PathVariable Integer productId, @Valid @RequestBody InventoryAdjustmentRequest request) {
        // Ensure the productId in the path matches the productId in the request
        request.setProductId(productId);
        return productHistoryService.createAdjustment(request);
    }


    @PostMapping("/{productId}/purchases")
    public PurchaseHistoryResponse createPurchase(@PathVariable Integer productId, @Valid @RequestBody PurchaseRequest request) {
        // Ensure the productId in the path matches the productId in the request
        request.setProductId(productId);
        return purchaseService.createPurchase(request);
    }

    private Pageable buildPageable(int page, int size, String sort) {
        String[] sortParts = sort.split(",");
        String sortProperty = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && "desc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(direction, sortProperty));
    }
}
