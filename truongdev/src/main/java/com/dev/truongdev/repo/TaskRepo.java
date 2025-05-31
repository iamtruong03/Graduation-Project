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

    @Query("SELECT t FROM Task t " +
            "WHERE t.status = :status " +
            "AND (LOWER(t.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:taskTypeId IS NULL OR t.taskTypeId = :taskTypeId) " +
            "AND (:assigneeId IS NULL OR t.assigneeId = :assigneeId) " +
            "ORDER BY t.createDate DESC")
    Page<Task> searchByCodeOrName(
            @Param("status") Integer status,
            @Param("search") String search,
            @Param("taskTypeId") Integer taskTypeId,
            @Param("assigneeId") String assigneeId,
            Pageable pageable
    );

    @Query("SELECT t FROM Task t " +
            "WHERE t.status = :status " +
            "AND t.departmentId IN :departmentIds " +
            "AND (LOWER(t.code) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:taskTypeId IS NULL OR t.taskTypeId = :taskTypeId) " +
            "AND (:assigneeId IS NULL OR t.assigneeId = :assigneeId) " +
            "ORDER BY t.createDate DESC")
    Page<Task> searchByCodeOrNameAndDepartments(
            @Param("status") Integer status,
            @Param("search") String search,
            @Param("departmentIds") List<Long> departmentIds,
            @Param("taskTypeId") Integer taskTypeId,
            @Param("assigneeId") String assigneeId,
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
    boolean existsByDepartmentIdAndStateAndStatus(Long departmentId, Integer state, Integer status);

    // Check if user is assigned to active tasks
    boolean existsByAssigneeIdAndStateAndStatus(String assigneeId, Integer state, Integer status);

    List<Task> findByProjectIdAndStatus(Long projectId, Integer status);

    List<Task> findByRiskIdAndStatus(Long riskId, Integer status);
}