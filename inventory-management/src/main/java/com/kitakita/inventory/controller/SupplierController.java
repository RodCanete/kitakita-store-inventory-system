package com.kitakita.inventory.controller;

import com.kitakita.inventory.entity.Supplier;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.service.SupplierService;
import com.kitakita.inventory.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SupplierController {
    
    @Autowired
    private SupplierService supplierService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Supplier supplier) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser != null) {
            // Set the user ID on the supplier
            supplier.setUserId(currentUser.getUserId());
        }
        
        Supplier createdSupplier = supplierService.createSupplier(supplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSupplier);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Integer id) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Supplier supplier = supplierService.getSupplierById(id);
        // Check if the supplier belongs to the current user
        if (supplier.getUserId() != null && !supplier.getUserId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(supplier);
    }
    
    @GetMapping
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get suppliers for the current user only
        List<Supplier> suppliers = supplierService.getSuppliersByUserId(currentUser.getUserId());
        return ResponseEntity.ok(suppliers);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Supplier>> getActiveSuppliers() {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get active suppliers for the current user only
        List<Supplier> suppliers = supplierService.getActiveSuppliersByUserId(currentUser.getUserId());
        return ResponseEntity.ok(suppliers);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Integer id, @RequestBody Supplier supplierDetails) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // If the user is not an admin, check if the supplier belongs to them
        if (!currentUser.getRole().equals("ROLE_ADMIN")) {
            Supplier existingSupplier = supplierService.getSupplierById(id);
            if (existingSupplier.getUserId() != null && !existingSupplier.getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        // Set the user ID on the supplier details to prevent users from changing ownership
        supplierDetails.setUserId(currentUser.getUserId());
        
        Supplier updatedSupplier = supplierService.updateSupplier(id, supplierDetails);
        return ResponseEntity.ok(updatedSupplier);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Integer id) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // If the user is not an admin, check if the supplier belongs to them
        if (!currentUser.getRole().equals("ROLE_ADMIN")) {
            Supplier existingSupplier = supplierService.getSupplierById(id);
            if (existingSupplier.getUserId() != null && !existingSupplier.getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }
}