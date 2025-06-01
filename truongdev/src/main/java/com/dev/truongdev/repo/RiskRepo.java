package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskRepo extends XDevBaseRepo<Risk> {
    // Additional custom query methods if needed

    @Query("SELECT r FROM Risk r " +
            "WHERE r.status = :status " +
            "AND (LOWER(r.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:riskTypeId IS NULL OR r.riskTypeId = :riskTypeId) " +
            "AND (:reflectorId IS NULL OR r.reflectorId = :reflectorId) " +
            "ORDER BY r.createDate DESC")
    Page<Risk> searchByCodeOrName(
            @Param("status") Integer status,
            @Param("search") String search,
            @Param("riskTypeId") Long riskTypeId,
            @Param("reflectorId") String reflectorId,
            Pageable pageable
    );

    @Query("SELECT r FROM Risk r " +
            "WHERE r.status = :status " +
            "AND r.departmentId IN :departmentIds " +
            "AND (LOWER(r.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:riskTypeId IS NULL OR r.riskTypeId = :riskTypeId) " +
            "AND (:reflectorId IS NULL OR r.reflectorId = :reflectorId) " +
            "ORDER BY r.createDate DESC")
    Page<Risk> searchByCodeOrNameAndDepartments(
            @Param("status") Integer status,
            @Param("search") String search,
            @Param("departmentIds") List<Long> departmentIds,
            @Param("riskTypeId") Long riskTypeId,
            @Param("reflectorId") String reflectorId,
            Pageable pageable
    );

} 