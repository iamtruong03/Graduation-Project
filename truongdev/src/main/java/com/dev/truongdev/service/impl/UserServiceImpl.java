package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.request.UpdatePasswordRequest;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import com.dev.truongdev.dto.UserRegistrationDTO;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserServiceImpl extends
    XDevBaseServiceImpl<User, UserRepo> implements
    IUserService {

  final UserRepo userRepo;
  final DepartmentServiceImpl departmentService;

  public UserServiceImpl(UserRepo repo, DepartmentServiceImpl departmentService) {
    super(repo);
    this.userRepo = repo;
    this.departmentService = departmentService;

  }
  @Override
  public Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new AccessDeniedException("Không có quyền truy cập");
    }
    String currentUsername = authentication.getName();
    return userRepo.findByCode(currentUsername)
        .map(User::getId)
        .orElseThrow(() -> new AccessDeniedException("Không tìm thấy thông tin người dùng"));
  }

  @Override
  public void updatePassword(UpdatePasswordRequest updatePasswordRequest) {
    User result = userRepo.findByCode(updatePasswordRequest.getCode())
        .orElseThrow(() -> new RuntimeException("User not found"));

    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    if (!encoder.matches(updatePasswordRequest.getPassword(), result.getPassword())) {
      throw new RuntimeException("Password wrong");
    }

    result.setPassword(encoder.encode(updatePasswordRequest.getNewPassword()));
    userRepo.save(result);
  }

  @Override
  public User confirmLogin(String code, String password) {
    User user = userRepo.findByCode(code)
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user == null || !new BCryptPasswordEncoder().matches(password, user.getPassword())) {
      throw new RuntimeException("Error: Username or Password wrong!");
    }

    if (user.getStatus().equals(AppConstants.STATUS_INACTIVE)) {
      throw new RuntimeException("Account Locked");
    }

    return user;
  }

  @Override
  public List<User> listUserDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("ROLE_ADMIN")) {
      return userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }

    return userRepo.findByDepartmentIdAndStatus(user.getDepartmentId(), AppConstants.STATUS_ACTIVE);
  }

  @Override
  public List<User> listUserChildDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("ROLE_ADMIN")) {
      return userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }
    List<Department> departments = departmentService.getAllSubDepartments(user.getDepartmentId());

    List<Long> departmentIds = departments.stream()
        .map(Department::getId)
        .collect(Collectors.toList());

    return userRepo.findByDepartmentIdInAndStatus(
        departmentIds, AppConstants.STATUS_ACTIVE);

  }

  @Override
  public List<User> listUserParentDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("ROLE_ADMIN")) {
      return userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }
    Department department = departmentService.getById(uid, user.getDepartmentId());

    return userRepo.findByDepartmentIdAndStatus(department.getParentId(), AppConstants.STATUS_ACTIVE);
  }

  @Override
  public List<User> listHeadChildDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("ROLE_ADMIN")) {
      return userRepo.findAllByPositionIdAndStatus(AppConstants.POSITION_HEAD, AppConstants.STATUS_ACTIVE);
    }

    List<Department> departments = departmentService.getAllSubDepartments(user.getDepartmentId());

    List<Long> departmentIds = departments.stream()
        .map(Department::getId)
        .collect(Collectors.toList());

    return userRepo.findByDepartmentIdInAndPositionIdAndStatus(
        departmentIds, AppConstants.POSITION_HEAD, AppConstants.STATUS_ACTIVE);

  }
}
