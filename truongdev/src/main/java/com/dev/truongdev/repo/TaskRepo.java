package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Task;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends XDevBaseRepo<Task> {
    List<Task> findByProjectId(Long projectId);

    @Query("SELECT t FROM Task t " +
            "WHERE t.status = :status " +
            "AND (LOWER(t.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY t.createDate DESC")
    Page<Task> searchByCodeOrName(
            @Param("status") Integer status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT t FROM Task t " +
            "WHERE t.status = :status " +
            "AND t.departmentId IN :departmentIds " +
            "AND (LOWER(t.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY t.createDate DESC")
    Page<Task> searchByCodeOrNameAndDepartments(
            @Param("status") Integer status,
            @Param("search") String search,
            @Param("departmentIds") List<Long> departmentIds,
            Pageable pageable
    );

    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByDepartmentId(Long departmentId);

}