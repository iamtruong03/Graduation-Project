package com.dev.truongdev.service;

import com.dev.truongdev.dto.ProjectDTO;
import com.dev.truongdev.entity.Project;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.ProjectHistoryDTO;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IProjectService extends IXDevBaseService<Project, ProjectFilter> {
    ProjectDTO createProject(String uid, ProjectDTO projectDTO);
    ProjectDTO submitForApproval(String uid, Long id, List<Long> approverIds);
    ProjectDTO approveProject(String uid, Long id, String approvedBy);
    ProjectDTO updateProjectState(String uid, Long id, Integer newState, String changedBy, String comment);
    void checkAndUpdateProjectCompletion(Long projectId);
    ProjectDTO updateProject(Long id, ProjectDTO projectDTO);
    List<ProjectHistoryDTO> getProjectHistory(Long projectId);
    void addProjectHistory(Long projectId, Integer previousState, Integer newState, String changedBy, String comment);
    ProjectDTO rejectProject(String uid, Long id, String reason);
    
    // Thêm method lấy danh sách dự án chờ duyệt
    Page<Project> getPendingApprovalProjects(String approverId, ProjectFilter filter, Pageable pageable);
}
