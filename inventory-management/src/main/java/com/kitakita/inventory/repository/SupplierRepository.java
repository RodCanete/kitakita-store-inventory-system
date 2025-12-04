package com.kitakita.inventory.repository;

import com.kitakita.inventory.entity.Supplier;
import com.kitakita.inventory.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    
    @Query("SELECT s FROM Supplier s WHERE s.user = :user")
    List<Supplier> findByUser(@Param("user") User user);
    
    @Query("SELECT s FROM Supplier s WHERE s.user = :user")
    Page<Supplier> findByUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT s FROM Supplier s WHERE s.user = :user AND " +
           "(LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Supplier> findByUserAndSearch(@Param("user") User user, @Param("search") String search, Pageable pageable);
}