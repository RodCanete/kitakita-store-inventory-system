package com.kitakita.inventory.controller;

import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.service.ProductService;
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
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser != null) {
            // Set the user ID on the product
            product.setUserId(currentUser.getUserId());
        }
        
        Product createdProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer id) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Product product = productService.getProductById(id);
        // Check if the product belongs to the current user
        if (product.getUserId() != null && !product.getUserId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(product);
    }
    
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get products for the current user only
        List<Product> products = productService.getProductsByUserId(currentUser.getUserId());
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Product>> getActiveProducts() {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get active products for the current user only
        List<Product> products = productService.getActiveProductsByUserId(currentUser.getUserId());
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String name) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Search products for the current user only
        List<Product> products = productService.searchProductsByNameAndUserId(name, currentUser.getUserId());
        return ResponseEntity.ok(products);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(@PathVariable Integer id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Integer categoryId) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get products for the current user and category
        List<Product> products = productService.getProductsByCategoryAndUserId(categoryId, currentUser.getUserId());
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<Product>> getProductsBySupplier(@PathVariable Integer supplierId) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get products for the current user and supplier
        List<Product> products = productService.getProductsBySupplierAndUserId(supplierId, currentUser.getUserId());
        return ResponseEntity.ok(products);
    }
}