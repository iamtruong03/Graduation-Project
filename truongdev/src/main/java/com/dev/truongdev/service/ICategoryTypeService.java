package com.dev.truongdev.service;

import com.dev.truongdev.entity.CategoryType;
import com.dev.truongdev.payload.filter.CategoryTypeFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.CategoryTypeDTO;

public interface ICategoryTypeService extends IXDevBaseService<CategoryType, CategoryTypeFilter> {

    CategoryTypeDTO getCategoryTypeById(Long id);

    CategoryTypeDTO updateCategoryType(Long id, CategoryTypeDTO categoryTypeDTO);

    void deleteCategoryType(Long id);
}
 