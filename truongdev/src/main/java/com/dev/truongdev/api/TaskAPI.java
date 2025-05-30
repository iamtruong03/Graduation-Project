package com.dev.truongdev.api;

import com.dev.truongdev.dto.TaskDTO;
import com.dev.truongdev.dto.TaskHistoryDTO;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.payload.filter.TaskFilter;
import com.dev.truongdev.service.ITaskService;
import com.dev.truongdev.service.IExcelExportService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskAPI extends XDevBaseAPI<Task, TaskFilter> {

    final ITaskService taskService;
    final IExcelExportService excelExportService;

    @SuppressWarnings("unchecked")
    public IXDevBaseService<Task, TaskFilter> getService() {
        return taskService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<TaskDTO>> createTask(
            @RequestAttribute String uid,
            @RequestBody TaskDTO taskDTO) {
        try {
            return ApiResponse.ok(taskService.createTask(uid, taskDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/submit-approval")
    public ResponseEntity<ApiResponse<TaskDTO>> submitForApproval(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestBody List<Long> approverIds) {
        try {
            return ApiResponse.ok(taskService.submitForApproval(uid, id, approverIds));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<TaskDTO>> approveTask(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestParam String approvedBy) {
        try {
            return ApiResponse.ok(taskService.approveTask(uid, id, approvedBy));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<TaskDTO>> rejectTask(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            return ApiResponse.ok(taskService.rejectTask(uid, id, reason));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<TaskDTO>> updateTask(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestBody TaskDTO taskDTO) {
        try {
            taskDTO.setUpdateBy(uid);
            return ApiResponse.ok(taskService.updateTask(id, taskDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<TaskHistoryDTO>>> getTaskHistory(
            @RequestAttribute String uid,
            @PathVariable Long id) {
        try {
            return ApiResponse.ok(taskService.getTaskHistory(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/pending-approval")
    public ResponseEntity<ApiResponse<Page<Task>>> getPendingApprovalTasks(
            @RequestAttribute String uid,
            TaskFilter filter,
            Pageable pageable) {
        try {
            return ApiResponse.ok(taskService.getPendingApprovalTasks(uid, filter, pageable));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Export danh sách công việc ra file Excel.
     * @param did ID phòng ban (từ JWT token)
     * @param uid ID người dùng yêu cầu (từ JWT token)
     * @param filter Bộ lọc tìm kiếm
     * @return File Excel chứa danh sách công việc
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTasks(
            @RequestAttribute Long did,
            @RequestAttribute String uid,
            TaskFilter filter) {
        try {
            ByteArrayOutputStream outputStream = excelExportService.exportTasks(did, uid, filter);
            
            // Tạo tên file với timestamp
            String fileName = "DanhSachCongViec_" + 
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + 
                ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(outputStream.toByteArray(), headers, HttpStatus.OK);
                    
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(("{\"error\":\"" + e.getMessage() + "\"}").getBytes());
        }
    }

} 