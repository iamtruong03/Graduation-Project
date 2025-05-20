package com.dev.truongdev.service;

import com.dev.truongdev.entity.Project;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.ProjectDTO;
import com.dev.truongdev.dto.ProjectHistoryDTO;
import java.util.List;

public interface IProjectService extends IXDevBaseService<Project, ProjectFilter> {
    ProjectDTO getProjectById(Long id);
    ProjectDTO updateProject(Long id, ProjectDTO projectDTO);
    List<ProjectHistoryDTO> getProjectHistory(Long projectId);
    void addProjectHistory(Long projectId, Integer previousState, Integer newState, String changedBy, String comment);
}
