package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import com.dev.truongdev.dto.UserRegistrationDTO;
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
    return userRepo.findByCode(currentUsername)
        .map(User::getId)
        .orElseThrow(() -> new AccessDeniedException("Không tìm thấy thông tin người dùng"));
  }

  @Override
  public Long getCurrentUserCode() {
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
  public String getCurrentUserRole(Long userId) {
    return userRepo.findById(userId)
        .map(User::getRole)
        .orElseThrow(() -> new AccessDeniedException("Không tìm thấy thông tin người dùng"));
  }

  @Override
  public Long getCurrentUserDepartmentId(Long userId) {
    return userRepo.findById(userId)
        .map(User::getDepartmentId)
        .orElseThrow(() -> new AccessDeniedException("Không tìm thấy thông tin người dùng"));
  }

  @Override
  public boolean isUserManager(Long userId) {
    return "ROLE_MANAGER".equals(getCurrentUserRole(userId));
  }

  @Override
  public boolean isUserAdmin(Long userId) {
    return "ROLE_ADMIN".equals(getCurrentUserRole(userId));
  }

  @Override
  public Long findById(Long id) {
    return userRepo.findById(id)
        .map(User::getId)
        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));
  }

  public UserServiceImpl(UserRepo repo, PasswordEncoder passwordEncoder, DepartmentServiceImpl departmentService) {
    super(repo);
    this.userRepo = repo;
    this.passwordEncoder = passwordEncoder;
    this.departmentService = departmentService;
  }

  @Override
  public Long save(UserRegistrationDTO userDTO) {
    validateUserData(userDTO.getDepartmentId(), userDTO.getPositionId(), userDTO.getPhoneNumber(), userDTO.getEmail());
    validateDepartmentAccess(userDTO.getDepartmentId());

    User user = userDTO.getId() != null ? userRepo.findById(userDTO.getId()).orElse(new User()) : new User();
    user.setCode(userDTO.getCode());
    user.setName(userDTO.getName());
    user.setDepartmentId(userDTO.getDepartmentId());
    user.setPositionId(userDTO.getPositionId());
    user.setPhoneNumber(userDTO.getPhoneNumber());
    user.setEmail(userDTO.getEmail());
    user.setAddress(userDTO.getAddress());
    user.setGender(userDTO.getGender());

    if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
      user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
    }
    if (userDTO.getRole() == null || userDTO.getRole().isEmpty()) {
      user.setRole("ROLE_USER");
    } else {
      user.setRole(userDTO.getRole());
    }

    return userRepo.save(user).getId();
  }

  public Long registerNewUser(UserRegistrationDTO userDTO) {
    // Kiểm tra nếu đã có admin thì không cho đăng ký thêm
    if (hasAdmin()) {
      throw new AccessDeniedException("Hệ thống đã có admin, không thể đăng ký thêm");
    }

    // Luôn gán role ADMIN
    userDTO.setRole("ROLE_ADMIN");

    if (userDTO.getDepartmentId() == null) {
      Department rootDepartment = departmentService.getRootDepartment();
      userDTO.setDepartmentId(rootDepartment.getId());
    }

    User user = new User();
    user.setCode(userDTO.getCode());
    user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
    user.setRole(userDTO.getRole());

    return userRepo.save(user).getId();
  }

  public boolean hasAdmin() {
    return userRepo.findAll().stream().anyMatch(user -> "ROLE_ADMIN".equals(user.getRole()));
  }

  @Override
  public void assignAdminRole(Long userId) {
    User user = userRepo.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + userId));
    user.setRole("ROLE_ADMIN");
    userRepo.save(user);
  }

  @Override
  public void validateUserData(Long departmentId, Long positionId, String phoneNumber, String email) {
    if (departmentId == null) {
      throw new IllegalArgumentException("Mã phòng ban không được để trống");
    }
    if (positionId == null) {
      throw new IllegalArgumentException("Mã chức vụ không được để trống");
    }
    if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
      throw new IllegalArgumentException("Số điện thoại không được để trống");
    }
    if (email == null || email.trim().isEmpty()) {
      throw new IllegalArgumentException("Email không được để trống");
    }
  }

  private void validateDepartmentAccess(Long departmentId) {
    Long currentUserId = getCurrentUserId();

    // Nếu là ADMIN thì cho phép tạo tài khoản ở bất kỳ phòng ban nào
    if (isUserAdmin(currentUserId)) {
      return;
    }

    // Kiểm tra xem người dùng hiện tại có phải là trưởng phòng không
    if (!isUserManager(currentUserId)) {
      throw new AccessDeniedException("Chỉ có trưởng phòng mới có thể tạo tài khoản cho nhân viên");
    }

    // Kiểm tra xem phòng ban của user mới có phải là phòng ban con của người dùng
    // hiện tại không
    Long currentUserDepartmentId = getCurrentUserDepartmentId(currentUserId);
    if (!departmentService.isParentOrAncestorOf(currentUserDepartmentId, departmentId)) {
      throw new AccessDeniedException("Bạn chỉ có thể tạo tài khoản cho nhân viên thuộc phòng ban con của mình");
    }
  }
}
