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
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryTypeAPI extends XDevBaseAPI<CategoryType, CategoryTypeFilter> {

    ICategoryTypeService categoryTypeService;

    @Override
    @SuppressWarnings("unchecked")
    public <S extends IXDevBaseService<CategoryType, CategoryTypeFilter>> S getService() {
        return (S) categoryTypeService;
    }

} 