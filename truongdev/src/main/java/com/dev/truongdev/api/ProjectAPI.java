package com.dev.truongdev.api;

import com.dev.truongdev.entity.Project;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("project")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectAPI extends XDevBaseAPI<Project, ProjectFilter> {

  final IXDevBaseService<Project, ProjectFilter> service;

  @SuppressWarnings("unchecked")
  public IXDevBaseService<Project, ProjectFilter> getService(){
    return service;
  }
}

