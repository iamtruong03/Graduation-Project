package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserServiceImpl extends
    XDevBaseServiceImpl<User, UserRepo> implements
    IUserService {

  final UserRepo userRepo;

  public UserServiceImpl(UserRepo repo) {
    super(repo);
    this.userRepo = repo;
  }
}
