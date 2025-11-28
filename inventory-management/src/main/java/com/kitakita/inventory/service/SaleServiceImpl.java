package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Sale;
import com.kitakita.inventory.dto.SaleDTO;
import com.kitakita.inventory.entity.Product;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.SaleRepository;
import com.kitakita.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService {
    
    @Autowired
    private SaleRepository saleRepository;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Override
    public Sale createSale(Sale sale) {
        // Handle product association explicitly
        try {
            // Check if we have a product ID through the productId field
            if (sale.getProductId() != null) {
                // Fetch the full product entity from the database using the productId field
                Product fullProduct = productRepository.findById(sale.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + sale.getProductId()));
                
                // Set the product on the sale
                sale.setProduct(fullProduct);
                
                // Deduct the sold quantity from the product's inventory
                int newQuantity = fullProduct.getQuantity() - sale.getQuantity();
                
                // Ensure we don't go below zero
                if (newQuantity < 0) {
                    newQuantity = 0;
                }
                
                // Update the product quantity
                fullProduct.setQuantity(newQuantity);
                productService.updateProduct(fullProduct.getProductId(), fullProduct);
            }
            // Check if we have a product object with ID (fallback for old format)
            else if (sale.getProduct() != null && sale.getProduct().getProductId() != null) {
                // Fetch the full product entity from the database
                Product fullProduct = productRepository.findById(sale.getProduct().getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + sale.getProduct().getProductId()));
                
                // Explicitly set the product on the sale
                sale.setProduct(fullProduct);
                
                // Deduct the sold quantity from the product's inventory
                int newQuantity = fullProduct.getQuantity() - sale.getQuantity();
                
                // Ensure we don't go below zero
                if (newQuantity < 0) {
                    newQuantity = 0;
                }
                
                // Update the product quantity
                fullProduct.setQuantity(newQuantity);
                productService.updateProduct(fullProduct.getProductId(), fullProduct);
            } else if (sale.getProduct() != null && sale.getProduct().getProductId() == null) {
                // Product object exists but ID is null
                throw new ResourceNotFoundException("Product ID is missing");
            } else {
                // No product information provided
                throw new ResourceNotFoundException("Product information is missing. Received data: " + 
                    "productId=" + sale.getProductId() + ", product=" + sale.getProduct());
            }
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            throw new ResourceNotFoundException("Product information is missing or invalid: " + e.getMessage());
        }
        
        return saleRepository.save(sale);
    }
    
    @Override
    public Sale getSaleById(Integer saleId) {
        return saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + saleId));
    }
    
    @Override
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }
    
    @Override
    public List<Sale> getSalesByUserId(Integer userId) {
        return saleRepository.findByUserUserIdOrderBySaleDateDesc(userId);
    }
    
    @Override
    public Sale updateSale(Integer saleId, Sale saleDetails) {
        Sale sale = getSaleById(saleId);
        
        sale.setSaleCode(saleDetails.getSaleCode());
        sale.setProduct(saleDetails.getProduct());
        sale.setQuantity(saleDetails.getQuantity());
        sale.setUnitPrice(saleDetails.getUnitPrice());
        sale.setTotalValue(saleDetails.getTotalValue());
        sale.setBuyingPrice(saleDetails.getBuyingPrice());
        sale.setUser(saleDetails.getUser());
        sale.setNotes(saleDetails.getNotes());
        
        return saleRepository.save(sale);
    }
    
    @Override
    public void deleteSale(Integer saleId) {
        Sale sale = getSaleById(saleId);
        saleRepository.delete(sale);
    }
    
    @Override
    public SaleDTO convertToDTO(Sale sale) {
        if (sale == null) {
            return null;
        }
        
        SaleDTO.ProductDTO productDTO = null;
        if (sale.getProduct() != null) {
            productDTO = SaleDTO.ProductDTO.builder()
                    .productId(sale.getProduct().getProductId())
                    .productName(sale.getProduct().getProductName())
                    .productCode(sale.getProduct().getProductCode())
                    .unit(sale.getProduct().getUnit())
                    .buyingPrice(sale.getProduct().getBuyingPrice())
                    .sellingPrice(sale.getProduct().getSellingPrice())
                    .build();
        }
        
        return SaleDTO.builder()
                .saleId(sale.getSaleId())
                .saleCode(sale.getSaleCode())
                .product(productDTO)
                .quantity(sale.getQuantity())
                .unitPrice(sale.getUnitPrice())
                .totalValue(sale.getTotalValue())
                .buyingPrice(sale.getBuyingPrice())
                .saleDate(sale.getSaleDate())
                .notes(sale.getNotes())
                .build();
    }
    
    @Override
    public List<SaleDTO> convertToDTOList(List<Sale> sales) {
        return sales.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}