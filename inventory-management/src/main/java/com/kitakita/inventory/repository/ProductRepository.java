package com.kitakita.inventory.repository;

import com.kitakita.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    
    Optional<Product> findByProductCode(String productCode);
    
    List<Product> findByProductNameContainingIgnoreCase(String productName);
    
    List<Product> findByIsActiveTrue();
    
    List<Product> findByCategoryCategoryId(Integer categoryId);
    
    List<Product> findBySupplierSupplierId(Integer supplierId);
    
    // User-specific methods
    List<Product> findByUserId(Integer userId);
    
    List<Product> findByUserIdAndIsActiveTrue(Integer userId);
    
    List<Product> findByProductNameContainingIgnoreCaseAndUserId(String productName, Integer userId);
    
    List<Product> findByCategoryCategoryIdAndUserId(Integer categoryId, Integer userId);
    
    List<Product> findBySupplierSupplierIdAndUserId(Integer supplierId, Integer userId);
}