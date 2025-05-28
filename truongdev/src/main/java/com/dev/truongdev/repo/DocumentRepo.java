package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Document;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentRepo extends XDevBaseRepo<Document> {
    // Additional custom query methods if needed

    @Query("SELECT d FROM Document d " +
            "WHERE d.status = :status " +
            "AND (LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY d.createDate DESC")
    Page<Document> searchByCodeOrName(
            @Param("status") Integer status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT d FROM Document d " +
            "WHERE d.status = :status " +
            "AND d.departmentId IN :departmentIds " +
            "AND (LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY d.createDate DESC")
    Page<Document> searchByCodeOrNameAndDepartments(
            @Param("status") Integer status,
            @Param("search") String search,
            @Param("departmentIds") List<Long> departmentIds,
            Pageable pageable
    );
}
