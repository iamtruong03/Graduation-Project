package com.dev.truongdev.api;

import com.dev.truongdev.dto.TaskDTO;
import com.dev.truongdev.dto.TaskHistoryDTO;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.payload.filter.TaskFilter;
import com.dev.truongdev.service.ITaskService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskAPI extends XDevBaseAPI<Task, TaskFilter> {

    final ITaskService taskService;

    @SuppressWarnings("unchecked")
    public IXDevBaseService<Task, TaskFilter> getService() {
        return taskService;
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<TaskDTO>> getTaskById(@PathVariable Long id) {
        try {
            return ApiResponse.ok(taskService.getTaskById(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDTO taskDTO) {
        try {
            return ApiResponse.ok(taskService.updateTask(id, taskDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<TaskHistoryDTO>>> getTaskHistory(@PathVariable Long id) {
        try {
            return ApiResponse.ok(taskService.getTaskHistory(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/history")
    public ResponseEntity<ApiResponse<Void>> addTaskHistory(
            @PathVariable Long id,
            @RequestParam Integer previousState,
            @RequestParam Integer newState,
            @RequestParam String changedBy,
            @RequestParam(required = false) String comment) {
        try {
            taskService.addTaskHistory(id, previousState, newState, changedBy, comment);
            return ApiResponse.ok(null);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
} 