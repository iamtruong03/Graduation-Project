package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Category;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepo extends XDevBaseRepo<Category> {
    // Additional custom query methods if needed
} 