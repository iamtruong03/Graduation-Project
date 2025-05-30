package com.dev.truongdev.api;

import com.dev.truongdev.entity.Project;
import com.dev.truongdev.entity.ProjectHistory;
import com.dev.truongdev.dto.ProjectDTO;
import com.dev.truongdev.dto.ProjectHistoryDTO;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.repo.ProjectHistoryRepo;
import com.dev.truongdev.service.IProjectService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectAPI extends XDevBaseAPI<Project, ProjectFilter> {

    final IProjectService projectService;
    final ProjectHistoryRepo projectHistoryRepo;
    final IExcelExportService excelExportService;

    @SuppressWarnings("unchecked")
    public IXDevBaseService<Project, ProjectFilter> getService() {
        return projectService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ProjectDTO>> createProject(
            @RequestAttribute String uid,
            @RequestBody ProjectDTO projectDTO) {
        try {
            return ApiResponse.ok(projectService.createProject(uid, projectDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/submit-approval")
    public ResponseEntity<ApiResponse<ProjectDTO>> submitForApproval(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestBody List<Long> approverIds) {
        try {
            return ApiResponse.ok(projectService.submitForApproval(uid, id, approverIds));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ProjectDTO>> approveProject(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestParam String approvedBy) {
        try {
            return ApiResponse.ok(projectService.approveProject(uid, id, approvedBy));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ProjectDTO>> rejectProject(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            return ApiResponse.ok(projectService.rejectProject(uid, id, reason));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<ProjectDTO>> getProjectById(@PathVariable Long id) {
        try {
            return ApiResponse.ok(projectService.getProjectById(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProject(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestBody ProjectDTO projectDTO) {
        try {
            projectDTO.setUpdateBy(uid);
            return ApiResponse.ok(projectService.updateProject(id, projectDTO));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<ProjectHistoryDTO>>> getProjectHistory(
            @RequestAttribute String uid,
            @PathVariable Long id) {
        try {
            return ApiResponse.ok(projectService.getProjectHistory(id));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/update-state")
    public ResponseEntity<ApiResponse<ProjectDTO>> updateProjectState(
            @RequestAttribute String uid,
            @PathVariable Long id,
            @RequestParam Integer newState,
            @RequestParam String changedBy,
            @RequestParam(required = false) String comment) {
        try {
            return ApiResponse.ok(projectService.updateProjectState(uid, id, newState, changedBy, comment));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/pending-approval")
    public ResponseEntity<ApiResponse<Page<Project>>> getPendingApprovalProjects(
            @RequestAttribute String uid,
            ProjectFilter filter,
            Pageable pageable) {
        try {
            return ApiResponse.ok(projectService.getPendingApprovalProjects(uid, filter, pageable));
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/check-completion")
    public ResponseEntity<ApiResponse<Void>> checkAndUpdateProjectCompletion(
            @PathVariable Long id) {
        try {
            projectService.checkAndUpdateProjectCompletion(id);
            return ApiResponse.ok(null, "Project completion status checked and updated successfully");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Export danh sách dự án ra file Excel.
     * @param did ID phòng ban (từ JWT token)
     * @param uid ID người dùng yêu cầu (từ JWT token)
     * @param filter Bộ lọc tìm kiếm
     * @return File Excel chứa danh sách dự án
     */
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportProjects(
            @RequestAttribute Long did,
            @RequestAttribute String uid,
            ProjectFilter filter) {
        try {
            ByteArrayOutputStream outputStream = excelExportService.exportProjects(did, uid, filter);
            
            // Tạo tên file với timestamp
            String fileName = "DanhSachDuAn_" + 
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + 
                ".xlsx";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                           "attachment; filename*=UTF-8''" + URLEncoder.encode(fileName, StandardCharsets.UTF_8))
                    .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(outputStream.toByteArray());
                    
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(("{\"error\":\"" + e.getMessage() + "\"}").getBytes());
        }
    }
}

