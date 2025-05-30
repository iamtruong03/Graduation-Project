package com.dev.truongdev.service;

import com.dev.truongdev.entity.Task;
import com.dev.truongdev.payload.filter.TaskFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.TaskDTO;
import com.dev.truongdev.dto.TaskHistoryDTO;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ITaskService extends IXDevBaseService<Task, TaskFilter> {

    TaskDTO updateTask(Long id, TaskDTO taskDTO);
    List<TaskHistoryDTO> getTaskHistory(Long taskId);
    void addTaskHistory(Long taskId, Integer previousState, Integer newState, String changedBy, String comment);
    
    // Add approval flow methods
    TaskDTO createTask(String uid, TaskDTO taskDTO);
    TaskDTO submitForApproval(String uid, Long id, List<Long> approverIds);
    TaskDTO approveTask(String uid, Long id, String approvedBy);
    TaskDTO rejectTask(String uid, Long id, String reason);
    void checkAndUpdateTaskCompletion(Long taskId);
    Page<Task> getPendingApprovalTasks(String approverId, TaskFilter filter, Pageable pageable);
} 