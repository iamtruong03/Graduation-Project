package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.filter.UserFilter;
import com.dev.truongdev.payload.request.UpdatePasswordRequest;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.repo.TaskRepo;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserServiceImpl extends XDevBaseServiceImpl<User, UserFilter, UserRepo> 
        implements IUserService {

  final UserRepo userRepo;
  final DepartmentServiceImpl departmentService;
  final ProjectRepo projectRepo;
  final TaskRepo taskRepo;

  public UserServiceImpl(UserRepo repo, DepartmentServiceImpl departmentService, 
                        ProjectRepo projectRepo, TaskRepo taskRepo) {
    super(repo);
    this.userRepo = repo;
    this.departmentService = departmentService;
    this.projectRepo = projectRepo;
    this.taskRepo = taskRepo;
  }

  public void setBaseEntity (User e, String uid){
    e.setCreateBy(Optional.ofNullable(e.getCreateBy()).orElse(uid));
    e.setUpdateBy(uid);
    e.setStatus(AppConstants.STATUS_ACTIVE);
    e.setRole("ROLE_USER");
  }

  @Override
  @Transactional
  public User create(String uid, User e){
    if (userRepo.existsByCodeIgnoreCase(e.getCode().trim())) {
      throw new RuntimeException("Người dùng đã tồn tại: " + e.getCode());
    }
    setBaseEntity(e, uid);
    e.setPassword(new BCryptPasswordEncoder().encode(e.getPassword()));
    return userRepo.save(e);
  }

  @Override
  public void updatePassword(String uid, UpdatePasswordRequest updatePasswordRequest) {
    User result = userRepo.findById(Long.valueOf(uid))
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

  // user trong phòng ban
  @Override
  public List<User> listUserDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("ROLE_ADMIN")) {
      return userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }

    return userRepo.findByDepartmentIdAndStatus(user.getDepartmentId(), AppConstants.STATUS_ACTIVE);
  }

  // user con và user phòng ban chính nó
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
  public Page<User> searchAll(Long did, String uid, UserFilter filter, Pageable pageable){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("ROLE_ADMIN")) {
      return userRepo.searchUser(
          AppConstants.STATUS_ACTIVE,
          filter.getSearch(),
          filter.getDepartmentId(),
          filter.getPositionId(),
          userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE),
          pageable
      );
    } else {
      List<Department> departments = new ArrayList<>();
      Department currentDepartment = departmentService.getById(uid, did);
      departments.add(currentDepartment);
      departments.addAll(departmentService.getAllSubDepartments(did));

      List<Long> departmentIds = departments.stream()
          .map(Department::getId)
          .collect(Collectors.toList());

      List<User> users = userRepo.findByDepartmentIdInAndStatus(
          departmentIds, AppConstants.STATUS_ACTIVE);

      return userRepo.searchUser(
          AppConstants.STATUS_ACTIVE,
          filter.getSearch(),
          filter.getDepartmentId(),
          filter.getPositionId(),
          users,
          pageable
      );
    }
  }

  // user phòng ban cha
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

  // list truong phong ban con
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

  @Override
  public String getUserDisplayName(String userId) {
    User user = userRepo.findById(Long.valueOf(userId))
            .orElse(null);
    return user != null ? user.getName() : userId;
  }

  @Override
  public void delete(String uid, Long id) {
    // Kiểm tra user có phải người quản lý dự án đang thực hiện không
    boolean hasActiveProjects = projectRepo.existsByManagerIdAndState(
        id.toString(), 
        AppConstants.STATUS_IN_PROGRESS
    );
    if (hasActiveProjects) {
      throw new RuntimeException("Không thể xóa người dùng đang quản lý dự án đang thực hiện");
    }

    // Kiểm tra user có phải người phụ trách dự án đang thực hiện không
    hasActiveProjects = projectRepo.existsByResponsibleIdsContainingAndState(
        id.toString(),
        AppConstants.STATUS_IN_PROGRESS
    );
    if (hasActiveProjects) {
      throw new RuntimeException("Không thể xóa người dùng đang phụ trách dự án đang thực hiện");
    }

    // Kiểm tra user có phải người được giao task đang thực hiện không
    boolean hasActiveTasks = taskRepo.existsByAssigneeIdAndState(
        id.toString(),
        AppConstants.STATUS_IN_PROGRESS
    );
    if (hasActiveTasks) {
      throw new RuntimeException("Không thể xóa người dùng đang được giao task đang thực hiện");
    }

    // Nếu không có ràng buộc thì thực hiện xóa
    super.delete(uid, id);
  }
}
