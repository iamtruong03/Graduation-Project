package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Category;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepo extends XDevBaseRepo<Category> {
    // Additional custom query methods if needed

    @Query("SELECT c FROM Category c " +
            "WHERE c.status = :status " +
            "AND (LOWER(c.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY c.createDate DESC")
    Page<Category> searchByCodeOrName(
            @Param("status") Integer status,
            @Param("search") String search,
            Pageable pageable
    );
} 