package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.Project;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.service.IProjectService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectServiceImpl extends
    XDevBaseServiceImpl<Project, ProjectRepo> implements
    IProjectService {

  final ProjectRepo projectRepo;

  public ProjectServiceImpl(ProjectRepo repo) {
    super(repo);
    this.projectRepo = repo;
  }
}
