package com.dev.truongdev.service;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.UserRegistrationDTO;

public interface IUserService extends IXDevBaseService<User> {
  Long save(UserRegistrationDTO userDTO);
  Long getCurrentUserId();
  Long getCurrentUserCode();
  Long findById(Long id);
  Long registerNewUser(UserRegistrationDTO userDTO);
  void validateUserData(Long departmentId, Long positionId, String phoneNumber, String email);
  
  // Các phương thức mới cho việc xử lý userId
  String getCurrentUserRole(Long userId);
  Long getCurrentUserDepartmentId(Long userId);
  boolean isUserManager(Long userId);
  boolean isUserAdmin(Long userId);
  void assignAdminRole(Long userId);
}
