package com.dev.truongdev.api;

import com.dev.truongdev.entity.Project;
import com.dev.truongdev.entity.ProjectHistory;
import com.dev.truongdev.dto.ProjectDTO;
import com.dev.truongdev.dto.ProjectHistoryDTO;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.repo.ProjectHistoryRepo;
import com.dev.truongdev.service.IProjectService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectAPI extends XDevBaseAPI<Project, ProjectFilter> {

    final IProjectService projectService;
    final ProjectHistoryRepo projectHistoryRepo;

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

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<ProjectHistoryDTO>>> getProjectHistory(
            @RequestAttribute String uid,
            @PathVariable Long id) {
        try {
            List<ProjectHistory> histories = projectHistoryRepo.findByProjectIdOrderByChangedAtDesc(id);
            List<ProjectHistoryDTO> dtos = histories.stream().map(history -> {
                ProjectHistoryDTO dto = new ProjectHistoryDTO();
                dto.setId(history.getId());
                dto.setProjectId(history.getProjectId());
                dto.setPreviousState(history.getPreviousState());
                dto.setNewState(history.getNewState());
                dto.setChangedBy(history.getChangedBy());
                dto.setChangedAt(history.getChangedAt());
                dto.setComment(history.getComment());
                return dto;
            }).toList();
            return ApiResponse.ok(dtos);
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
}

