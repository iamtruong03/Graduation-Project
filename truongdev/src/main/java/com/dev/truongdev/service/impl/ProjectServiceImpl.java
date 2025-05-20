package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.ProjectDTO;
import com.dev.truongdev.dto.ProjectHistoryDTO;
import com.dev.truongdev.entity.Project;
import com.dev.truongdev.entity.ProjectHistory;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.repo.ProjectHistoryRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.service.IProjectService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.StateNameUtils;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectServiceImpl extends XDevBaseServiceImpl<Project, ProjectFilter, ProjectRepo> 
        implements IProjectService {

    final ProjectRepo projectRepo;
    final ProjectHistoryRepo projectHistoryRepository;
    final IUserService userService;

    public ProjectServiceImpl(ProjectRepo repo, ProjectHistoryRepo historyRepo, IUserService userService) {
        super(repo);
        this.projectRepo = repo;
        this.projectHistoryRepository = historyRepo;
        this.userService = userService;
    }

    @Override
    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return convertToDTO(project);
    }

    @Override
    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO projectDTO) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        Integer previousState = project.getState();
        
        // Update project fields
        project.setState(projectDTO.getState());
        project.setProjectTypeId(projectDTO.getProjectTypeId());
        project.setDepartmentId(projectDTO.getDepartmentId());
        project.setStartDate(projectDTO.getStartDate());
        project.setDeadline(projectDTO.getDeadline());
        project.setActualEndDate(projectDTO.getActualEndDate());
        project.setPriorityId(projectDTO.getPriorityId());
        project.setApproverId(projectDTO.getApproverId());
        project.setResponsibleIds(projectDTO.getResponsibleIds());
        project.setManagerId(projectDTO.getManagerId());
        
        project = projectRepo.save(project);
        
        // Add history if state changed
        if (!previousState.equals(project.getState())) {
            addProjectHistory(id, previousState, project.getState(), projectDTO.getUpdateBy(), "Cập nhật trạng thái");
        }
        
        return convertToDTO(project);
    }

    @Override
    public List<ProjectHistoryDTO> getProjectHistory(Long projectId) {
        return projectHistoryRepository.findByProjectIdOrderByChangedAtDesc(projectId)
                .stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void addProjectHistory(Long projectId, Integer previousState, Integer newState, String changedBy, String comment) {
        ProjectHistory history = ProjectHistory.builder()
                .projectId(projectId)
                .previousState(previousState)
                .newState(newState)
                .changedBy(changedBy)
                .changedAt(new Date())
                .comment(comment)
                .build();
        projectHistoryRepository.save(history);
    }

    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setCode(project.getCode());
        dto.setName(project.getName());
        dto.setState(project.getState());
        dto.setProjectTypeId(project.getProjectTypeId());
        dto.setDepartmentId(project.getDepartmentId());
        dto.setStartDate(project.getStartDate());
        dto.setDeadline(project.getDeadline());
        dto.setActualEndDate(project.getActualEndDate());
        dto.setPriorityId(project.getPriorityId());
        dto.setApproverId(project.getApproverId());
        dto.setResponsibleIds(project.getResponsibleIds());
        dto.setManagerId(project.getManagerId());
        
        // Set display names
        dto.setStateName(StateNameUtils.getProjectStateName(project.getState()));
        dto.setApproverName(userService.getUserDisplayName(project.getApproverId()));
        dto.setManagerName(userService.getUserDisplayName(project.getManagerId()));
        
        // Set responsible names
        if (project.getResponsibleIds() != null) {
            List<String> responsibleNames = project.getResponsibleIds().stream()
                    .map(userService::getUserDisplayName)
                    .collect(Collectors.toList());
            dto.setResponsibleNames(responsibleNames);
        }
        
        return dto;
    }

    private ProjectHistoryDTO convertHistoryToDTO(ProjectHistory history) {
        ProjectHistoryDTO dto = new ProjectHistoryDTO();
        dto.setId(history.getId());
        dto.setProjectId(history.getProjectId());
        dto.setPreviousState(history.getPreviousState());
        dto.setNewState(history.getNewState());
        dto.setChangedBy(history.getChangedBy());
        dto.setChangedAt(history.getChangedAt());
        dto.setComment(history.getComment());
        
        // Set display names
        dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        dto.setStateName(StateNameUtils.getProjectStateName(history.getNewState()));
        
        return dto;
    }
}
