package com.dev.truongdev.repo;

import com.dev.truongdev.entity.ProjectHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectHistoryRepo extends JpaRepository<ProjectHistory, Long> {
    List<ProjectHistory> findByProjectIdOrderByChangedAtDesc(Long projectId);
} 