package com.kitakita.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_adjustments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "adjustment_id")
    private Integer adjustmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "adjustment_type", nullable = false, columnDefinition = "ENUM('add', 'remove', 'correction')")
    private AdjustmentType adjustmentType;

    @Column(nullable = false)
    private Integer quantity;

    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adjusted_by", nullable = false)
    private User adjustedBy;

    @CreationTimestamp
    @Column(name = "adjustment_date", updatable = false)
    private LocalDateTime adjustmentDate;

    public enum AdjustmentType {
        ADD, REMOVE, CORRECTION
    }
}