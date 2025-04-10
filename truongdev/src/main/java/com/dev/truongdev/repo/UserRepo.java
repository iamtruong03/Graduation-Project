package com.dev.truongdev.repo;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends XDevBaseRepo<User> {
    Optional<User> findByCode(String code);

}
