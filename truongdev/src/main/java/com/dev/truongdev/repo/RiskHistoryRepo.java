package com.dev.truongdev.repo;

import com.dev.truongdev.entity.RiskHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskHistoryRepo extends JpaRepository<RiskHistory, Long> {
    List<RiskHistory> findByRiskIdOrderByChangedAtDesc(Long riskId);
} 