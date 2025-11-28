package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Category;
import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.entity.Supplier;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.CategoryRepository;
import com.kitakita.inventory.repository.ProductRepository;
import com.kitakita.inventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @Override
    public Product createProduct(Product product) {
        // If categoryId is provided, set the category
        if (product.getCategoryId() != null) {
            Category category = categoryRepository.findById(product.getCategoryId())
                    .orElse(null);
            product.setCategory(category);
        }
        
        // If supplierId is provided, set the supplier
        if (product.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(product.getSupplierId())
                    .orElse(null);
            product.setSupplier(supplier);
        }
        
        return productRepository.save(product);
    }
    
    @Override
    public Product getProductById(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }
    
    @Override
    public Product getProductByCode(String productCode) {
        return productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with code: " + productCode));
    }
    
    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    @Override
    public List<Product> getActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }
    
    @Override
    public List<Product> searchProductsByName(String productName) {
        return productRepository.findByProductNameContainingIgnoreCase(productName);
    }
    
    @Override
    public Product updateProduct(Integer productId, Product productDetails) {
        Product product = getProductById(productId);
        
        product.setProductName(productDetails.getProductName());
        product.setProductCode(productDetails.getProductCode());
        product.setCategory(productDetails.getCategory());
        product.setSupplier(productDetails.getSupplier());
        product.setBuyingPrice(productDetails.getBuyingPrice());
        product.setSellingPrice(productDetails.getSellingPrice());
        product.setUnit(productDetails.getUnit());
        product.setQuantity(productDetails.getQuantity());
        product.setThresholdValue(productDetails.getThresholdValue());
        product.setOpeningStock(productDetails.getOpeningStock());
        product.setOnTheWay(productDetails.getOnTheWay());
        product.setExpiryDate(productDetails.getExpiryDate());
        product.setImageUrl(productDetails.getImageUrl());
        product.setIsActive(productDetails.getIsActive());
        
        return productRepository.save(product);
    }
    
    @Override
    public void deleteProduct(Integer productId) {
        Product product = getProductById(productId);
        productRepository.delete(product);
    }
    
    @Override
    public List<Product> getProductsByCategory(Integer categoryId) {
        return productRepository.findByCategoryCategoryId(categoryId);
    }
    
    @Override
    public List<Product> getProductsBySupplier(Integer supplierId) {
        return productRepository.findBySupplierSupplierId(supplierId);
    }
    
    // User-specific methods
    @Override
    public List<Product> getProductsByUserId(Integer userId) {
        return productRepository.findByUserId(userId);
    }
    
    @Override
    public List<Product> getActiveProductsByUserId(Integer userId) {
        return productRepository.findByUserIdAndIsActiveTrue(userId);
    }
    
    @Override
    public List<Product> searchProductsByNameAndUserId(String productName, Integer userId) {
        return productRepository.findByProductNameContainingIgnoreCaseAndUserId(productName, userId);
    }
    
    @Override
    public List<Product> getProductsByCategoryAndUserId(Integer categoryId, Integer userId) {
        return productRepository.findByCategoryCategoryIdAndUserId(categoryId, userId);
    }
    
    @Override
    public List<Product> getProductsBySupplierAndUserId(Integer supplierId, Integer userId) {
        return productRepository.findBySupplierSupplierIdAndUserId(supplierId, userId);
    }
}