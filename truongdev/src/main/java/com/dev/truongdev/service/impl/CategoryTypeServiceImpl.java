package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.CategoryTypeDTO;
import com.dev.truongdev.entity.CategoryType;
import com.dev.truongdev.payload.filter.CategoryTypeFilter;
import com.dev.truongdev.repo.CategoryTypeRepo;
import com.dev.truongdev.service.ICategoryTypeService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryTypeServiceImpl extends XDevBaseServiceImpl<CategoryType, CategoryTypeFilter, CategoryTypeRepo>
        implements ICategoryTypeService {

    final CategoryTypeRepo categoryTypeRepo;

    public CategoryTypeServiceImpl(CategoryTypeRepo repo) {
        super(repo);
        this.categoryTypeRepo = repo;
    }

    @Override
    public CategoryTypeDTO getCategoryTypeById(Long id) {
        CategoryType categoryType = categoryTypeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category type not found"));
        return convertToDTO(categoryType);
    }

    @Override
    @Transactional
    public CategoryTypeDTO updateCategoryType(Long id, CategoryTypeDTO categoryTypeDTO) {
        CategoryType categoryType = categoryTypeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category type not found"));
        
        categoryType.setName(categoryTypeDTO.getName());
        categoryType.setCode(categoryTypeDTO.getCode());
        categoryType.setDescription(categoryTypeDTO.getDescription());
        
        categoryType = categoryTypeRepo.save(categoryType);
        return convertToDTO(categoryType);
    }

    @Override
    public void deleteCategoryType(Long id) {
        if (!categoryTypeRepo.existsById(id)) {
            throw new RuntimeException("Category type not found");
        }
        categoryTypeRepo.deleteById(id);
    }

    @Override
    public Page<CategoryType> searchAll(Long departmentId, String uid, CategoryTypeFilter filter, Pageable pageable) {
        return categoryTypeRepo.searchByCodeOrName(
            1, // STATUS_ACTIVE
            filter.getSearch(),
            pageable
        );
    }

    private CategoryTypeDTO convertToDTO(CategoryType categoryType) {
        CategoryTypeDTO dto = new CategoryTypeDTO();
        BeanUtils.copyProperties(categoryType, dto);
        return dto;
    }
} 