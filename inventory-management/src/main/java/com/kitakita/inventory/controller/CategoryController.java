package com.kitakita.inventory.controller;

import com.kitakita.inventory.dto.request.CategoryRequest;
import com.kitakita.inventory.dto.response.CategoryResponse;
import com.kitakita.inventory.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping
    public List<CategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }
    
    @GetMapping("/{categoryId}")
    public CategoryResponse getCategory(@PathVariable Integer categoryId) {
        return categoryService.getCategoryById(categoryId);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(@Valid @RequestBody CategoryRequest request) {
        return categoryService.createCategory(request);
    }
    
    @PutMapping("/{categoryId}")
    public CategoryResponse updateCategory(@PathVariable Integer categoryId, 
                                          @Valid @RequestBody CategoryRequest request) {
        return categoryService.updateCategory(categoryId, request);
    }
    
    @DeleteMapping("/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Integer categoryId) {
        categoryService.deleteCategory(categoryId);
    }
}