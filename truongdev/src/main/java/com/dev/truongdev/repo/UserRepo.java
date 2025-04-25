package com.dev.truongdev.repo;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import java.util.List;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends XDevBaseRepo<User> {

    Optional<User> findByCode(String code);
    Optional<User> findByEmail(String email);

    List<User> findByDepartmentIdAndStatus(Long did, Integer status);

    List<User> findByDepartmentIdInAndStatus(List<Long> dids, Integer status);

    List<User> findByDepartmentIdInAndPositionIdAndStatus(List<Long> dids, Integer positionId, Integer status);

    List<User> findAllByPositionIdAndStatus(Integer positionId,Integer status);
}
