package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.stereotype.Repository;

@Repository
public interface RiskRepo extends XDevBaseRepo<Risk> {
    // Additional custom query methods if needed
} 