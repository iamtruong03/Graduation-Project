package com.dev.truongdev.repo;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends XDevBaseRepo<User> {

    Long countByDepartmentIn(List<Department> departments);
    Long countByDepartmentId(Long departmentId);
    List<User> findByDepartmentId(Long departmentId);

    Boolean existsByCodeIgnoreCase(String code);

    Optional<User> findByCode(String code);
    Optional<User> findByEmail(String email);

    List<User> findByDepartmentIdAndStatus(Long did, Integer status);

    List<User> findByDepartmentIdInAndStatus(List<Long> dids, Integer status);

    List<User> findByDepartmentIdInAndPositionIdAndStatus(List<Long> dids, Integer positionId, Integer status);

    List<User> findAllByPositionIdAndStatus(Integer positionId,Integer status);

    List<User> findAllByStatus(Integer status);

    List<User> findByDepartmentIdAndPositionIdAndStatus(Long departmentId, Integer positionId, Integer status);

    @Query("SELECT d FROM User d "
        + "WHERE d.status = :status "
        + "AND (LOWER(d.code) LIKE LOWER(CONCAT('%', :search, '%')) "
        + "OR LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%'))) "
        + "AND (:departmentId IS NULL OR d.departmentId = :departmentId) "
        + "AND (:positionId IS NULL OR d.positionId = :positionId) "
        + "AND d IN :users "
        + "ORDER BY d.createDate DESC")
    Page<User> searchUser(
        @Param("status") Integer status,
        @Param("search") String search,
        @Param("departmentId") Long departmentId,
        @Param("positionId") Long positionId,
        @Param("users") List<User> users,
        Pageable pageable
    );
}
