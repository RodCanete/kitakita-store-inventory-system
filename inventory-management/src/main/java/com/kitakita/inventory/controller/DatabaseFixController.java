package com.kitakita.inventory.controller;

import com.kitakita.inventory.entity.Purchase;
import com.kitakita.inventory.repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.annotation.security.PermitAll;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/fix")
@CrossOrigin(origins = "*") // Allow all origins for this fix endpoint
public class DatabaseFixController {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping("/purchase-status")
    @PermitAll
    @Transactional
    public ResponseEntity<String> fixPurchaseStatus() {
        try {
            // Direct SQL query to fix the enum values in the database
            Query query = entityManager.createNativeQuery(
                "UPDATE purchases SET status = CASE " +
                "WHEN status = 'completed' THEN 'COMPLETED' " +
                "WHEN status = 'cancelled' THEN 'CANCELLED' " +
                "WHEN status = 'pending' THEN 'PENDING' " +
                "ELSE 'COMPLETED' END"
            );
            
            int updatedRows = query.executeUpdate();
            
            return ResponseEntity.ok("Fixed " + updatedRows + " purchase records");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fixing purchase status: " + e.getMessage());
        }
    }
}