package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Task;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepo extends XDevBaseRepo<Task> {
    // Additional custom query methods if needed
} 