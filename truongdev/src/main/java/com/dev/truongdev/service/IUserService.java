package com.dev.truongdev.service;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.filter.UserFilter;
import com.dev.truongdev.payload.request.UpdatePasswordRequest;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;

public interface IUserService extends IXDevBaseService<User, UserFilter> {

  User confirmLogin(String code, String password);

  void updatePassword(String uid, UpdatePasswordRequest updatePasswordRequest);

  List<User> listUserDep(String uid);

  List<User> listUserChildDep(String uid);

  List<User> listUserParentDep(String uid);

  List<User> listHeadChildDep(String uid);

  String getUserDisplayName(String userId);
}
