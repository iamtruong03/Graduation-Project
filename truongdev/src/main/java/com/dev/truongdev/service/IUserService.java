package com.dev.truongdev.service;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.filter.UserFilter;
import com.dev.truongdev.payload.request.UpdatePasswordRequest;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.UserRegistrationDTO;
import java.util.List;

public interface IUserService<E, F> extends IXDevBaseService<User, UserFilter> {
//  Long save(UserRegistrationDTO userDTO);
//  Long getCurrentUserCode();
//  Long findById(Long id);
//  Long registerNewUser(UserRegistrationDTO userDTO);
//  void validateUserData(Long departmentId, Long positionId, String phoneNumber, String email);
//
//  // Các phương thức mới cho việc xử lý userId
//  String getCurrentUserRole(Long userId);
//  Long getCurrentUserDepartmentId(Long userId);
//  boolean isUserManager(Long userId);
//  boolean isUserAdmin(Long userId);
//  void assignAdminRole(Long userId);

  User confirmLogin(String code, String password);

  void updatePassword(String uid, UpdatePasswordRequest updatePasswordRequest);

  List<User> listUserDep(String uid);

  List<User> listUserChildDep(String uid);

  List<User> listUserParentDep(String uid);

  List<User> listHeadChildDep(String uid);
}
