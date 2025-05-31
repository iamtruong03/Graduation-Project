package com.dev.truongdev.service;

import com.dev.truongdev.entity.Category;
import com.dev.truongdev.payload.filter.CategoryFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.CategoryDTO;
import java.util.List;

public interface ICategoryService extends IXDevBaseService<Category, CategoryFilter> {
  List<Category> getByCategoryType(String uid, String code);
} 