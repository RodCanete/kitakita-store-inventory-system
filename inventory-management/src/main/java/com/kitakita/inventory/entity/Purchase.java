package com.kitakita.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Purchase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "purchase_id")
    private Integer purchaseId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;
    
    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @CreationTimestamp
    @Column(name = "purchase_date", updatable = false)
    private LocalDateTime purchaseDate;
    
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('completed', 'cancelled', 'pending')")
    private PurchaseStatus status = PurchaseStatus.COMPLETED;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    public enum PurchaseStatus {
        COMPLETED, CANCELLED, PENDING
    }
}