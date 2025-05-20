package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.CategoryDTO;
import com.dev.truongdev.entity.Category;
import com.dev.truongdev.payload.filter.CategoryFilter;
import com.dev.truongdev.repo.CategoryRepo;
import com.dev.truongdev.service.ICategoryService;
import com.dev.truongdev.service.ICategoryTypeService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryServiceImpl extends XDevBaseServiceImpl<Category, CategoryFilter, CategoryRepo>
        implements ICategoryService {

    final CategoryRepo categoryRepo;
    final ICategoryTypeService categoryTypeService;

    public CategoryServiceImpl(CategoryRepo repo, ICategoryTypeService categoryTypeService) {
        super(repo);
        this.categoryRepo = repo;
        this.categoryTypeService = categoryTypeService;
    }

    @Override
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToDTO(category);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setCategoryTypeId(categoryDTO.getCategoryTypeId());
        
        category = categoryRepo.save(category);
        return convertToDTO(category);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepo.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        categoryRepo.deleteById(id);
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        BeanUtils.copyProperties(category, dto);
        
        // Set additional display names if needed
        if (category.getCategoryTypeId() != null) {
            try {
                dto.setCategoryTypeName(categoryTypeService.getCategoryTypeById(category.getCategoryTypeId()).getName());
            } catch (Exception e) {
                // Handle if category type not found
                dto.setCategoryTypeName("Unknown");
            }
        }
        
        return dto;
    }
} 