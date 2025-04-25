package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepo extends XDevBaseRepo<Department> {

    List<Department> findByParentIdAndStatus(Long parentId, Integer status);

    List<Department> findAllByStatus(Integer status);

    @Query("SELECT d FROM Department d "
        + "WHERE d.status = :status "
        + "AND (LOWER(d.code) "
        + "LIKE LOWER(CONCAT('%', :search, '%')) "
        + "OR LOWER(d.name) "
        + "LIKE LOWER(CONCAT('%', :search, '%'))) "
        + "AND d IN :departments"
        + " ORDER BY d.createDate DESC ")
    Page<Department> searchByCodeOrName(
        @Param("status") Integer status,
        @Param("search") String search,
        @Param("departments") List<Department> departments,
        Pageable pageable
    );

}
