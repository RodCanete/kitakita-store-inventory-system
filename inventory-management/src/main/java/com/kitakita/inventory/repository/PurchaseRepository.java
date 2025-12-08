package com.kitakita.inventory.repository;

import com.kitakita.inventory.entity.Purchase;
import com.kitakita.inventory.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Integer> {
    
    @Query("SELECT p FROM Purchase p WHERE p.product.user = :user AND p.product.productId = :productId")
    List<Purchase> findByUserAndProductId(@Param("user") User user, @Param("productId") Integer productId);
    
    @Query("SELECT p FROM Purchase p WHERE p.product.user = :user AND p.product.productId = :productId")
    Page<Purchase> findByUserAndProductId(@Param("user") User user, @Param("productId") Integer productId, Pageable pageable);
}