package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.Project;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepo extends XDevBaseRepo<Project> {

    List<Project> findByDepartmentIn(List<Department> departments);
    
    @Query("SELECT p FROM Project p " +
            "WHERE p.status = :status " +
            "AND (LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY p.createDate DESC")
    Page<Project> searchByCodeOrName(
            @Param("status") Integer status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT p FROM Project p " +
            "WHERE p.status = :status " +
            "AND p.departmentId IN :departmentIds " +
            "AND (LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY p.createDate DESC")
    Page<Project> searchByCodeOrNameAndDepartments(
            @Param("status") Integer status,
            @Param("search") String search,
            @Param("departmentIds") List<Long> departmentIds,
            Pageable pageable
    );

    @Query("SELECT p FROM Project p " +
            "WHERE p.status = :status " +
            "AND p.state = :state " +
            "AND p.approverId = :approverId " +
            "AND (LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY p.createDate DESC")
    Page<Project> findPendingApprovalProjects(
            @Param("status") Integer status,
            @Param("state") Integer state,
            @Param("approverId") String approverId,
            @Param("search") String search,
            Pageable pageable
    );

    List<Project> findByDepartmentId(Long departmentId);
}
