package com.dev.truongdev.service;

import com.dev.truongdev.entity.Task;
import com.dev.truongdev.payload.filter.TaskFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.TaskDTO;
import com.dev.truongdev.dto.TaskHistoryDTO;
import java.util.List;

public interface ITaskService extends IXDevBaseService<Task, TaskFilter> {
    TaskDTO getTaskById(Long id);
    TaskDTO updateTask(Long id, TaskDTO taskDTO);
    List<TaskHistoryDTO> getTaskHistory(Long taskId);
    void addTaskHistory(Long taskId, Integer previousState, Integer newState, String changedBy, String comment);
} 