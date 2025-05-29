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
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryTypeServiceImpl extends XDevBaseServiceImpl<CategoryType, CategoryTypeFilter, CategoryTypeRepo>
        implements ICategoryTypeService {

    CategoryTypeRepo categoryTypeRepo;

    public CategoryTypeServiceImpl(CategoryTypeRepo repo) {
        super(repo);
        this.categoryTypeRepo = repo;
    }

    @Override
    public Page<CategoryType> searchAll(Long departmentId, String uid, CategoryTypeFilter filter, Pageable pageable) {
        return categoryTypeRepo.searchByCodeOrName(
            1, // STATUS_ACTIVE
            filter.getSearch(),
            pageable
        );
    }
} 