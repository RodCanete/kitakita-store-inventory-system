package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.entity.Supplier;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.repository.ProductRepository;
import com.kitakita.inventory.repository.SupplierRepository;
import com.kitakita.inventory.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * This component initializes existing products and suppliers by assigning them to the first user
 * when the application starts. This is only needed for existing data migration.
 */
@Component
public class UserProductInitializer {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    @Transactional
    public void initializeUserProducts() {
        // Check if there are products without user assignment
        // This is a temporary solution for existing data
        try {
            List<Product> productsWithoutUser = productRepository.findAll().stream()
                    .filter(p -> p.getUser() == null)
                    .toList();

            List<Supplier> suppliersWithoutUser = supplierRepository.findAll().stream()
                    .filter(s -> s.getUser() == null)
                    .toList();

            if (!productsWithoutUser.isEmpty() || !suppliersWithoutUser.isEmpty()) {
                // Get the first user (admin or default user)
                User defaultUser = userRepository.findAll().stream().findFirst().orElse(null);
                
                if (defaultUser != null) {
                    // Assign all products without user to the default user
                    for (Product product : productsWithoutUser) {
                        product.setUser(defaultUser);
                        productRepository.save(product);
                    }
                    
                    // Assign all suppliers without user to the default user
                    for (Supplier supplier : suppliersWithoutUser) {
                        supplier.setUser(defaultUser);
                        supplierRepository.save(supplier);
                    }
                    
                    System.out.println("Assigned " + productsWithoutUser.size() + " products to user: " + defaultUser.getEmail());
                    System.out.println("Assigned " + suppliersWithoutUser.size() + " suppliers to user: " + defaultUser.getEmail());
                }
            }
        } catch (Exception e) {
            // Ignore errors during initialization
            System.err.println("Warning: Could not initialize user products: " + e.getMessage());
        }
    }
}