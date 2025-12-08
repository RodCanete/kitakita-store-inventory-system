package com.kitakita.inventory.repository;

import com.kitakita.inventory.entity.InventoryAdjustment;
import com.kitakita.inventory.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustment, Integer> {
    
    @Query("SELECT ia FROM InventoryAdjustment ia WHERE ia.product.user = :user AND ia.product.productId = :productId")
    List<InventoryAdjustment> findByUserAndProductId(@Param("user") User user, @Param("productId") Integer productId);
    
    @Query("SELECT ia FROM InventoryAdjustment ia WHERE ia.product.user = :user AND ia.product.productId = :productId")
    Page<InventoryAdjustment> findByUserAndProductId(@Param("user") User user, @Param("productId") Integer productId, Pageable pageable);
}