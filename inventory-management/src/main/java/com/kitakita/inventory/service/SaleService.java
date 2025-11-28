package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Sale;
import com.kitakita.inventory.dto.SaleDTO;
import java.util.List;

public interface SaleService {
    
    Sale createSale(Sale sale);
    
    Sale getSaleById(Integer saleId);
    
    List<Sale> getAllSales();
    
    List<Sale> getSalesByUserId(Integer userId);
    
    Sale updateSale(Integer saleId, Sale saleDetails);
    
    void deleteSale(Integer saleId);
    
    // DTO methods
    SaleDTO convertToDTO(Sale sale);
    List<SaleDTO> convertToDTOList(List<Sale> sales);
}