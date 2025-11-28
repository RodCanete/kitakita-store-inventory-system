package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Category;
import java.util.List;

public interface CategoryService {
    
    Category createCategory(Category category);
    
    Category getCategoryById(Integer categoryId);
    
    Category getCategoryByName(String categoryName);
    
    List<Category> getAllCategories();
    
    Category updateCategory(Integer categoryId, Category categoryDetails);
    
    void deleteCategory(Integer categoryId);
    
    boolean existsByName(String categoryName);
}