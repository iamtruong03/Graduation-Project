package com.dev.truongdev.service;

import com.dev.truongdev.entity.Task;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;

public interface ITaskService extends IXDevBaseService<Task> {
    Long save(Long taskId, String taskName, String description, Long projectId, Long departmentId, Long assigneeId, String status, String priority, String startDate, String endDate);
    Long createTask(String taskName, String description, Long projectId, Long departmentId, Long assigneeId, String priority, String startDate, String endDate);
    void updateTaskStatus(Long taskId, String status);
    void validateTaskData(String taskName, Long projectId, Long departmentId, Long assigneeId, String startDate, String endDate);
    void assignTask(Long taskId, Long assigneeId);
    boolean isTaskAssignee(Long userId, Long taskId);
    Long getTaskAssignee(Long taskId);
    void validateTaskAccess(Long taskId);
    void updateTaskPriority(Long taskId, String priority);
}