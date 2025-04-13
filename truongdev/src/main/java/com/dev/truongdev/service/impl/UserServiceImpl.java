package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserServiceImpl extends
    XDevBaseServiceImpl<User, UserRepo> implements
    IUserService {

  final UserRepo userRepo;
  final PasswordEncoder passwordEncoder;
  final DepartmentServiceImpl departmentService;

  @Override
  public Long getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new AccessDeniedException("Không có quyền truy cập");
    }
    String currentUsername = authentication.getName();
    User currentUser = userRepo.findByCode(currentUsername)
        .orElseThrow(() -> new AccessDeniedException("Không tìm thấy thông tin người dùng"));
    return currentUser.getId();
  }

  @Override
  public User getCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new AccessDeniedException("Không có quyền truy cập");
    }
    String currentUsername = authentication.getName();
    return userRepo.findByCode(currentUsername)
        .orElseThrow(() -> new AccessDeniedException("Không tìm thấy thông tin người dùng"));
  }

  @Override
  public User findById(Long id) {
    return userRepo.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));
  }

  public UserServiceImpl(UserRepo repo, PasswordEncoder passwordEncoder, DepartmentServiceImpl departmentService) {
    super(repo);
    this.userRepo = repo;
    this.passwordEncoder = passwordEncoder;
    this.departmentService = departmentService;
  }

  @Override
  public User save(User user) {
    validateUserData(user);
    validateDepartmentAccess(user);
    if (user.getPassword() != null && !user.getPassword().isEmpty()) {
      user.setPassword(passwordEncoder.encode(user.getPassword()));
    }
    if (user.getRole() == null || user.getRole().isEmpty()) {
      user.setRole("ROLE_USER");
    }
    return userRepo.save(user);
  }

  private void validateUserData(User user) {
    if (user.getDepartmentId() == null) {
      throw new IllegalArgumentException("Mã phòng ban không được để trống");
    }
    if (user.getPositionId() == null) {
      throw new IllegalArgumentException("Mã chức vụ không được để trống");
    }
    if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
      throw new IllegalArgumentException("Số điện thoại không được để trống");
    }
    if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
      throw new IllegalArgumentException("Email không được để trống");
    }
  }

  private void validateDepartmentAccess(User user) {
    // Lấy thông tin người dùng hiện tại từ SecurityContext
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new AccessDeniedException("Không có quyền truy cập");
    }

    String currentUsername = authentication.getName();
    User currentUser = userRepo.findByCode(currentUsername)
        .orElseThrow(() -> new AccessDeniedException("Không tìm thấy thông tin người dùng"));

    // Nếu là ADMIN thì cho phép tạo tài khoản ở bất kỳ phòng ban nào
    if ("ROLE_ADMIN".equals(currentUser.getRole())) {
      return;
    }

    // Kiểm tra xem người dùng hiện tại có phải là trưởng phòng không
    if (!"ROLE_MANAGER".equals(currentUser.getRole())) {
      throw new AccessDeniedException("Chỉ có trưởng phòng mới có thể tạo tài khoản cho nhân viên");
    }

    // Kiểm tra xem phòng ban của user mới có phải là phòng ban con của người dùng hiện tại không
    if (!departmentService.isParentOrAncestorOf(currentUser.getDepartmentId(), user.getDepartmentId())) {
      throw new AccessDeniedException("Bạn chỉ có thể tạo tài khoản cho nhân viên thuộc phòng ban con của mình");
    }
  }
}
