package com.kitakita.inventory.controller;

import com.kitakita.inventory.entity.Sale;
import com.kitakita.inventory.dto.SaleDTO;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.service.SaleService;
import com.kitakita.inventory.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SaleController {
    
    private static final Logger logger = Logger.getLogger(SaleController.class.getName());
    
    @Autowired
    private SaleService saleService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<SaleDTO> createSale(@RequestBody Sale sale) {
        logger.info("Received sale request: " + sale);
        
        // Log product information for debugging
        if (sale.getProduct() != null) {
            logger.info("Product ID from product object: " + sale.getProduct().getProductId());
        } else {
            logger.info("No product object provided");
        }
        
        // Log productId field for debugging
        if (sale.getProductId() != null) {
            logger.info("Product ID from productId field: " + sale.getProductId());
        } else {
            logger.info("No productId field provided");
        }
        
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser != null) {
            // Set the user on the sale
            sale.setUser(currentUser);
        }
        
        Sale createdSale = saleService.createSale(sale);
        SaleDTO saleDTO = saleService.convertToDTO(createdSale);
        return ResponseEntity.status(HttpStatus.CREATED).body(saleDTO);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SaleDTO> getSaleById(@PathVariable Integer id) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Sale sale = saleService.getSaleById(id);
        // Check if the sale belongs to the current user
        if (sale.getUser() != null && !sale.getUser().getUserId().equals(currentUser.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        SaleDTO saleDTO = saleService.convertToDTO(sale);
        return ResponseEntity.ok(saleDTO);
    }
    
    @GetMapping
    public ResponseEntity<List<SaleDTO>> getAllSales() {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Get sales for the current user only
        List<Sale> sales = saleService.getSalesByUserId(currentUser.getUserId());
        List<SaleDTO> saleDTOs = saleService.convertToDTOList(sales);
        return ResponseEntity.ok(saleDTOs);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<SaleDTO> updateSale(@PathVariable Integer id, @RequestBody Sale saleDetails) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // If the user is not an admin, check if the sale belongs to them
        if (!currentUser.getRole().equals("ROLE_ADMIN")) {
            Sale existingSale = saleService.getSaleById(id);
            if (existingSale.getUser() != null && !existingSale.getUser().getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        // Set the user on the sale details to prevent users from changing ownership
        saleDetails.setUser(currentUser);
        
        Sale updatedSale = saleService.updateSale(id, saleDetails);
        SaleDTO saleDTO = saleService.convertToDTO(updatedSale);
        return ResponseEntity.ok(saleDTO);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")
    public ResponseEntity<Void> deleteSale(@PathVariable Integer id) {
        // Get the current user's email from the security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        
        // Find the user by email to get their user ID
        User currentUser = userService.getUserByEmail(currentUserEmail);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // If the user is not an admin, check if the sale belongs to them
        if (!currentUser.getRole().equals("ROLE_ADMIN")) {
            Sale existingSale = saleService.getSaleById(id);
            if (existingSale.getUser() != null && !existingSale.getUser().getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        saleService.deleteSale(id);
        return ResponseEntity.noContent().build();
    }
}