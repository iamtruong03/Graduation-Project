package com.dev.truongdev.service;

import com.dev.truongdev.entity.Project;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;

public interface IProjectService<E, F> extends IXDevBaseService<Project, ProjectFilter> {

}
