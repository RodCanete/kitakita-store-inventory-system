package com.kitakita.inventory.service.impl;

import com.kitakita.inventory.dto.request.SupplierRequest;
import com.kitakita.inventory.dto.response.PagedResponse;
import com.kitakita.inventory.dto.response.SupplierResponse;
import com.kitakita.inventory.entity.Supplier;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.SupplierRepository;
import com.kitakita.inventory.security.SecurityUtils;
import com.kitakita.inventory.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<SupplierResponse> getSuppliers(String search, int page, int size) {
        User currentUser = securityUtils.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Supplier> supplierPage;
        if (StringUtils.hasText(search)) {
            search = search.trim().toLowerCase();
            supplierPage = supplierRepository.findByUserAndSearch(currentUser, search, pageable);
        } else {
            supplierPage = supplierRepository.findByUser(currentUser, pageable);
        }

        return PagedResponse.<SupplierResponse>builder()
                .content(supplierPage.getContent().stream().map(this::mapToResponse).toList())
                .totalElements(supplierPage.getTotalElements())
                .totalPages(supplierPage.getTotalPages())
                .page(supplierPage.getNumber())
                .size(supplierPage.getSize())
                .hasNext(supplierPage.hasNext())
                .hasPrevious(supplierPage.hasPrevious())
                .build();
    }

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        
        Supplier supplier = Supplier.builder()
                .supplierName(request.getSupplierName())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .address(request.getAddress())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .user(currentUser)
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public SupplierResponse updateSupplier(Integer id, SupplierRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        // Check if the supplier belongs to the current user
        if (!existing.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Supplier not found");
        }

        existing.setSupplierName(request.getSupplierName());
        existing.setContactNumber(request.getContactNumber());
        existing.setEmail(request.getEmail());
        existing.setAddress(request.getAddress());
        existing.setIsActive(request.getIsActive() != null ? request.getIsActive() : existing.getIsActive());

        Supplier updated = supplierRepository.save(existing);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteSupplier(Integer id) {
        User currentUser = securityUtils.getCurrentUser();
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));

        // Check if the supplier belongs to the current user
        if (!supplier.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResourceNotFoundException("Supplier not found");
        }

        supplierRepository.delete(supplier);
    }

    private SupplierResponse mapToResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .supplierId(supplier.getSupplierId())
                .supplierName(supplier.getSupplierName())
                .contactNumber(supplier.getContactNumber())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .isActive(supplier.getIsActive())
                .createdAt(supplier.getCreatedAt())
                .build();
    }
}