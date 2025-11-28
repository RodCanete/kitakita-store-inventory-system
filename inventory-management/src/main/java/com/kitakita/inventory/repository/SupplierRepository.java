package com.kitakita.inventory.repository;

import com.kitakita.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    
    Optional<Supplier> findBySupplierName(String supplierName);
    
    Optional<Supplier> findByEmail(String email);
    
    boolean existsBySupplierName(String supplierName);
    
    boolean existsByEmail(String email);
    
    // User-specific methods
    List<Supplier> findByUserId(Integer userId);
    
    List<Supplier> findByUserIdAndIsActiveTrue(Integer userId);
}