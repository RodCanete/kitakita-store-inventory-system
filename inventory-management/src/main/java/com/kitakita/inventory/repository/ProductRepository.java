package com.kitakita.inventory.repository;

import com.kitakita.inventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @Query("""
            SELECT p FROM Product p
            WHERE (:search IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:categoryId IS NULL OR p.category.categoryId = :categoryId)
            """)
    Page<Product> searchProducts(
            @Param("search") String search,
            @Param("categoryId") Integer categoryId,
            Pageable pageable
    );

    @Query("SELECT SUM(p.quantity) FROM Product p")
    Long getTotalQuantity();

    @Query("SELECT SUM(p.quantity * p.sellingPrice) FROM Product p")
    BigDecimal getInventoryValue();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity <= p.thresholdValue")
    Long getLowStockCount();

    List<Product> findTop5ByOrderByQuantityDesc();

    @Query("SELECT p FROM Product p WHERE p.quantity <= p.thresholdValue ORDER BY p.quantity ASC")
    List<Product> findLowStockProducts(Pageable pageable);

    boolean existsByProductCode(String productCode);
}

