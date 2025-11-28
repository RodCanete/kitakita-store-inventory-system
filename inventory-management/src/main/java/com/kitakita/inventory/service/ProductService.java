package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Product;
import java.util.List;

public interface ProductService {
    
    Product createProduct(Product product);
    
    Product getProductById(Integer productId);
    
    Product getProductByCode(String productCode);
    
    List<Product> getAllProducts();
    
    List<Product> getActiveProducts();
    
    List<Product> searchProductsByName(String productName);
    
    Product updateProduct(Integer productId, Product productDetails);
    
    void deleteProduct(Integer productId);
    
    List<Product> getProductsByCategory(Integer categoryId);
    
    List<Product> getProductsBySupplier(Integer supplierId);
    
    // User-specific methods
    List<Product> getProductsByUserId(Integer userId);
    
    List<Product> getActiveProductsByUserId(Integer userId);
    
    List<Product> searchProductsByNameAndUserId(String productName, Integer userId);
    
    List<Product> getProductsByCategoryAndUserId(Integer categoryId, Integer userId);
    
    List<Product> getProductsBySupplierAndUserId(Integer supplierId, Integer userId);
}