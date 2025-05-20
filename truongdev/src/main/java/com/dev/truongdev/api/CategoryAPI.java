package com.dev.truongdev.api;

import com.dev.truongdev.dto.CategoryDTO;
import com.dev.truongdev.entity.Category;
import com.dev.truongdev.payload.filter.CategoryFilter;
import com.dev.truongdev.service.ICategoryService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryAPI extends XDevBaseAPI<Category, CategoryFilter> {

    final ICategoryService categoryService;

    @SuppressWarnings("unchecked")
    public IXDevBaseService<Category, CategoryFilter> getService() {
        return categoryService;
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(@PathVariable Long id) {
        try {
            return ApiResponse.ok(categoryService.getCategoryById(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryDTO categoryDTO) {
        try {
            return ApiResponse.ok(categoryService.updateCategory(id, categoryDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ApiResponse.ok(null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 