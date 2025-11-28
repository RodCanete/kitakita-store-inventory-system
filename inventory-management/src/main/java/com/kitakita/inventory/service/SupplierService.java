package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Supplier;
import java.util.List;

public interface SupplierService {
    
    Supplier createSupplier(Supplier supplier);
    
    Supplier getSupplierById(Integer supplierId);
    
    Supplier getSupplierByName(String supplierName);
    
    Supplier getSupplierByEmail(String email);
    
    List<Supplier> getAllSuppliers();
    
    List<Supplier> getActiveSuppliers();
    
    Supplier updateSupplier(Integer supplierId, Supplier supplierDetails);
    
    void deleteSupplier(Integer supplierId);
    
    boolean existsByName(String supplierName);
    
    boolean existsByEmail(String email);
    
    // User-specific methods
    List<Supplier> getSuppliersByUserId(Integer userId);
    
    List<Supplier> getActiveSuppliersByUserId(Integer userId);
}