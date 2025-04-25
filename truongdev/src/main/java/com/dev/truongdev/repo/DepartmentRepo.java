package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepo extends XDevBaseRepo<Department> {

    Optional<Department> findByCode(String code);

    List<Department> findByParentIdAndStatus(Long parentId, Integer status);

    List<Department> findAllByStatus(Integer status);
}
