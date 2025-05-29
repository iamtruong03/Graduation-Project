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

    @Query("SELECT t FROM Task t " +
            "WHERE t.status = :status " +
            "AND t.state = :state " +
            "AND t.approverId = :approverId " +
            "AND (LOWER(t.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY t.createDate DESC")
    Page<Task> findPendingApprovalTasks(
            @Param("status") Integer status,
            @Param("state") Integer state,
            @Param("approverId") String approverId,
            @Param("search") String search,
            Pageable pageable
    );

    // Check if department has active tasks
    boolean existsByDepartmentIdAndState(Long departmentId, Integer state);

    // Check if user is assigned to active tasks
    boolean existsByAssigneeIdAndState(String assigneeId, Integer state);
}