package com.kitakita.inventory.service.impl;

import com.kitakita.inventory.dto.request.CategoryRequest;
import com.kitakita.inventory.dto.response.CategoryResponse;
import com.kitakita.inventory.entity.Category;
import com.kitakita.inventory.entity.User;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.CategoryRepository;
import com.kitakita.inventory.security.SecurityUtils;
import com.kitakita.inventory.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;
    
    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public CategoryResponse getCategoryById(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return mapToResponse(category);
    }
    
    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        // Check if category with same name already exists
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new RuntimeException("Category with this name already exists");
        }
        
        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setCreatedAt(LocalDateTime.now()); // Explicitly set createdAt
        
        Category savedCategory = categoryRepository.save(category);
        return mapToResponse(savedCategory);
    }
    
    @Override
    public CategoryResponse updateCategory(Integer categoryId, CategoryRequest request) {
        Category existing = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        // Check if another category with same name already exists
        Category duplicate = categoryRepository.findByCategoryName(request.getCategoryName());
        if (duplicate != null && !duplicate.getCategoryId().equals(categoryId)) {
            throw new RuntimeException("Category with this name already exists");
        }
        
        existing.setCategoryName(request.getCategoryName());
        existing.setDescription(request.getDescription());
        
        Category updatedCategory = categoryRepository.save(existing);
        return mapToResponse(updatedCategory);
    }
    
    @Override
    public void deleteCategory(Integer categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        // Check if category is being used by products
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new RuntimeException("Cannot delete category that is being used by products");
        }
        
        categoryRepository.delete(category);
    }
    
    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getCategoryId());
        response.setCategoryName(category.getCategoryName());
        response.setDescription(category.getDescription());
        response.setCreatedAt(category.getCreatedAt());
        return response;
    }
}