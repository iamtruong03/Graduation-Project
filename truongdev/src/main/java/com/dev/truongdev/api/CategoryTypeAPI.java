package com.dev.truongdev.api;

import com.dev.truongdev.dto.CategoryTypeDTO;
import com.dev.truongdev.entity.CategoryType;
import com.dev.truongdev.payload.filter.CategoryTypeFilter;
import com.dev.truongdev.service.ICategoryTypeService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/category-types")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryTypeAPI extends XDevBaseAPI<CategoryType, CategoryTypeFilter> {

    final ICategoryTypeService categoryTypeService;

    @SuppressWarnings("unchecked")
    public IXDevBaseService<CategoryType, CategoryTypeFilter> getService() {
        return categoryTypeService;
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<CategoryTypeDTO>> getCategoryTypeById(@PathVariable Long id) {
        try {
            return ApiResponse.ok(categoryTypeService.getCategoryTypeById(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<CategoryTypeDTO>> updateCategoryType(
            @PathVariable Long id,
            @RequestBody CategoryTypeDTO categoryTypeDTO) {
        try {
            return ApiResponse.ok(categoryTypeService.updateCategoryType(id, categoryTypeDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteCategoryType(@PathVariable Long id) {
        try {
            categoryTypeService.deleteCategoryType(id);
            return ApiResponse.ok(null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 