package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Task;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends XDevBaseRepo<Task> {
    List<Task> findByProjectId(Long projectId);
} 