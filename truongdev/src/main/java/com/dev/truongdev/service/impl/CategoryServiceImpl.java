package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.CategoryDTO;
import com.dev.truongdev.entity.Category;
import com.dev.truongdev.payload.filter.CategoryFilter;
import com.dev.truongdev.repo.CategoryRepo;
import com.dev.truongdev.service.ICategoryService;
import com.dev.truongdev.service.ICategoryTypeService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl extends XDevBaseServiceImpl<Category, CategoryFilter, CategoryRepo>
        implements ICategoryService {

    CategoryRepo categoryRepo;
    ICategoryTypeService categoryTypeService;
    IUserService userService;

    public CategoryServiceImpl(CategoryRepo repo, ICategoryTypeService categoryTypeService, IUserService userService) {
        super(repo);
        this.categoryRepo = repo;
        this.categoryTypeService = categoryTypeService;
        this.userService = userService;
    }

    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        return convertToDTO(category);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        // Validate category type exists
        if (categoryDTO.getCategoryTypeId() != null) {
            categoryTypeService.getCategoryTypeById(categoryDTO.getCategoryTypeId());
        }
        
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setCategoryTypeId(categoryDTO.getCategoryTypeId());
        
        category = categoryRepo.save(category);
        return convertToDTO(category);
    }

    @Override
    public Page<Category> searchAll(Long departmentId, String uid, CategoryFilter filter, Pageable pageable) {
        return categoryRepo.searchByCodeOrName(
            1, // STATUS_ACTIVE
            filter.getSearch(),
            pageable
        );
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        BeanUtils.copyProperties(category, dto);
        
        if (category.getCategoryTypeId() != null) {
            try {
                dto.setCategoryTypeName(categoryTypeService.getCategoryTypeById(category.getCategoryTypeId()).getName());
            } catch (Exception e) {
                dto.setCategoryTypeName("Unknown");
            }
        }
        
        return dto;
    }
} 