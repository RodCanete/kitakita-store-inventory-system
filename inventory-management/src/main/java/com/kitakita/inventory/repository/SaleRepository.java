package com.kitakita.inventory.repository;

import com.kitakita.inventory.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Integer> {
    
    List<Sale> findByUserUserId(Integer userId);
    
    List<Sale> findByUserUserIdOrderBySaleDateDesc(Integer userId);
}