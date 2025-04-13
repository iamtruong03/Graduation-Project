package com.dev.truongdev.service;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;

public interface IUserService extends IXDevBaseService<User> {
  User save(User user);
  Long getCurrentUserId();
  User getCurrentUser();
  User findById(Long id);
}
