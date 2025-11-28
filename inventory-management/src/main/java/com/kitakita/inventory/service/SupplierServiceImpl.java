package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Supplier;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @Override
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }
    
    @Override
    public Supplier getSupplierById(Integer supplierId) {
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));
    }
    
    @Override
    public Supplier getSupplierByName(String supplierName) {
        return supplierRepository.findBySupplierName(supplierName)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with name: " + supplierName));
    }
    
    @Override
    public Supplier getSupplierByEmail(String email) {
        return supplierRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with email: " + email));
    }
    
    @Override
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }
    
    @Override
    public List<Supplier> getActiveSuppliers() {
        return supplierRepository.findAll().stream()
                .filter(Supplier::getIsActive)
                .toList();
    }
    
    @Override
    public Supplier updateSupplier(Integer supplierId, Supplier supplierDetails) {
        Supplier supplier = getSupplierById(supplierId);
        
        // Preserve the user ID and created timestamp
        Integer userId = supplier.getUserId();
        LocalDateTime createdAt = supplier.getCreatedAt();
        
        supplier.setSupplierName(supplierDetails.getSupplierName());
        supplier.setContactNumber(supplierDetails.getContactNumber());
        supplier.setEmail(supplierDetails.getEmail());
        supplier.setAddress(supplierDetails.getAddress());
        supplier.setIsActive(supplierDetails.getIsActive());
        
        // Restore the user ID and created timestamp
        supplier.setUserId(userId);
        supplier.setCreatedAt(createdAt);
        
        return supplierRepository.save(supplier);
    }
    
    @Override
    public void deleteSupplier(Integer supplierId) {
        Supplier supplier = getSupplierById(supplierId);
        supplierRepository.delete(supplier);
    }
    
    @Override
    public boolean existsByName(String supplierName) {
        return supplierRepository.existsBySupplierName(supplierName);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return supplierRepository.existsByEmail(email);
    }
    
    // User-specific methods
    @Override
    public List<Supplier> getSuppliersByUserId(Integer userId) {
        return supplierRepository.findByUserId(userId);
    }
    
    @Override
    public List<Supplier> getActiveSuppliersByUserId(Integer userId) {
        return supplierRepository.findByUserIdAndIsActiveTrue(userId);
    }
}