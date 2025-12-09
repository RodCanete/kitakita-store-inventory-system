package com.kitakita.inventory.service;

import com.kitakita.inventory.dto.request.CategoryRequest;
import com.kitakita.inventory.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    
    List<CategoryResponse> getAllCategories();
    
    CategoryResponse getCategoryById(Integer categoryId);
    
    CategoryResponse createCategory(CategoryRequest request);
    
    CategoryResponse updateCategory(Integer categoryId, CategoryRequest request);
    
    void deleteCategory(Integer categoryId);
}