package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepo extends XDevBaseRepo<Department> {
    Optional<Department> findByCode(String code);
}
