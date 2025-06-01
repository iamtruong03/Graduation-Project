package com.dev.truongdev.api;

import com.dev.truongdev.dto.CategoryDTO;
import com.dev.truongdev.dto.ProjectHistoryDTO;
import com.dev.truongdev.entity.Category;
import com.dev.truongdev.payload.filter.CategoryFilter;
import com.dev.truongdev.service.ICategoryService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryAPI extends XDevBaseAPI<Category, CategoryFilter> {

    ICategoryService categoryService;

    @Override
    @SuppressWarnings("unchecked")
    public <S extends IXDevBaseService<Category, CategoryFilter>> S getService() {
        return (S) categoryService;
    }

    @GetMapping("/get-by-category-type")
    public ResponseEntity<ApiResponse<List<Category>>> getProjectHistory(
        @RequestAttribute String uid,
        @RequestParam String categoryTypeCode) {
        try {
            return ApiResponse.ok(categoryService.getByCategoryType(uid, categoryTypeCode));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}