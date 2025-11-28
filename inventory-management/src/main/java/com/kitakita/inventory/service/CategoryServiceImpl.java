package com.kitakita.inventory.service;

import com.kitakita.inventory.entity.Category;
import com.kitakita.inventory.exception.ResourceNotFoundException;
import com.kitakita.inventory.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Override
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }
    
    @Override
    public Category getCategoryById(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }
    
    @Override
    public Category getCategoryByName(String categoryName) {
        return categoryRepository.findByCategoryName(categoryName)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with name: " + categoryName));
    }
    
    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    @Override
    public Category updateCategory(Integer categoryId, Category categoryDetails) {
        Category category = getCategoryById(categoryId);
        
        category.setCategoryName(categoryDetails.getCategoryName());
        category.setDescription(categoryDetails.getDescription());
        
        return categoryRepository.save(category);
    }
    
    @Override
    public void deleteCategory(Integer categoryId) {
        Category category = getCategoryById(categoryId);
        categoryRepository.delete(category);
    }
    
    @Override
    public boolean existsByName(String categoryName) {
        return categoryRepository.existsByCategoryName(categoryName);
    }
}