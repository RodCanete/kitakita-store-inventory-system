package com.kitakita.inventory.repository;

import com.kitakita.inventory.entity.Sale;
import com.kitakita.inventory.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Integer> {
    
    @Query("SELECT s FROM Sale s WHERE s.user = :user")
    Page<Sale> findByUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT s FROM Sale s WHERE s.user = :user AND " +
           "(LOWER(s.product.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "s.saleCode LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Sale> findByUserAndSearch(@Param("user") User user, @Param("search") String search, Pageable pageable);
    
    @Query("SELECT SUM(s.totalValue) FROM Sale s WHERE s.user = :user")
    BigDecimal getTotalSalesValue(@Param("user") User user);
    
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.user = :user")
    Long getTotalSalesCount(@Param("user") User user);
    
    @Query("SELECT SUM(s.quantity) FROM Sale s WHERE s.user = :user")
    Long getTotalProductsSold(@Param("user") User user);
}