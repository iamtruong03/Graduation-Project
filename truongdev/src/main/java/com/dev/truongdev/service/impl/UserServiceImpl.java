package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.filter.UserFilter;
import com.dev.truongdev.payload.request.UpdatePasswordRequest;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.repo.TaskRepo;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.service.IDepartmentService;
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
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service implementation quản lý người dùng (User).
 * Xử lý CRUD operations, xác thực người dùng, quản lý quyền truy cập theo phòng ban.
 */
@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserServiceImpl extends XDevBaseServiceImpl<User, UserFilter, UserRepo> 
        implements IUserService {

  final UserRepo userRepo;
  final IDepartmentService departmentService; // Thay đổi kiểu từ DepartmentServiceImpl sang interface
  final ProjectRepo projectRepo;
  final TaskRepo taskRepo;

  public UserServiceImpl(UserRepo repo, @Lazy IDepartmentService departmentService,
                        ProjectRepo projectRepo, TaskRepo taskRepo) { // Thêm @Lazy
    super(repo);
    this.userRepo = repo;
    this.departmentService = departmentService;
    this.projectRepo = projectRepo;
    this.taskRepo = taskRepo;
  }

  /**
   * Thiết lập thông tin cơ bản cho entity User.
   * - Gán người tạo và người cập nhật
   * - Đặt trạng thái ACTIVE
   * - Gán role mặc định là 2
   * 
   * @param e Entity User cần thiết lập
   * @param uid ID người thực hiện
   */
  public void setBaseEntity (User e, String uid){
    e.setCreateBy(Optional.ofNullable(e.getCreateBy()).orElse(uid));
    e.setUpdateBy(uid);
    e.setStatus(AppConstants.STATUS_ACTIVE);
    e.setRole("2");
  }

  /**
   * Tạo mới người dùng với kiểm tra trùng lặp mã.
   * - Kiểm tra mã người dùng đã tồn tại
   * - Mã hóa mật khẩu
   * - Thiết lập thông tin cơ bản
   * 
   * @param uid ID người tạo
   * @param e Thông tin người dùng
   * @return User đã được tạo
   * @throws RuntimeException nếu mã người dùng đã tồn tại
   */
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

  /**
   * Cập nhật mật khẩu người dùng với xác thực mật khẩu cũ.
   * - Xác thực mật khẩu hiện tại
   * - Mã hóa và lưu mật khẩu mới
   * 
   * @param uid ID người dùng
   * @param updatePasswordRequest Thông tin cập nhật mật khẩu
   * @throws RuntimeException nếu mật khẩu cũ không đúng
   */
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

  /**
   * Xác thực đăng nhập người dùng.
   * - Kiểm tra tồn tại người dùng
   * - So sánh mật khẩu
   * - Kiểm tra trạng thái tài khoản
   * 
   * @param code Mã người dùng
   * @param password Mật khẩu
   * @return User nếu đăng nhập thành công
   * @throws RuntimeException nếu thông tin không đúng hoặc tài khoản bị khóa
   */
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

  /**
   * Lấy danh sách người dùng trong cùng phòng ban.
   * - Admin: xem tất cả người dùng
   * - Người dùng thường: chỉ xem người dùng cùng phòng ban
   */
  @Override
  public List<User> listUserDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("1")) {
      return userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }

    return userRepo.findByDepartmentIdAndStatus(user.getDepartmentId(), AppConstants.STATUS_ACTIVE);
  }

  /**
   * Lấy danh sách người dùng trong phòng ban và các phòng ban con.
   * - Admin: xem tất cả người dùng
   * - Người dùng thường: xem người dùng trong phòng ban và phòng ban con
   */
  @Override
  public List<User> listUserChildDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("1")) {
      return userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }
    List<Department> departments = departmentService.getAllSubDepartments(user.getDepartmentId());

    List<Long> departmentIds = departments.stream()
        .map(Department::getId)
        .collect(Collectors.toList());

    return userRepo.findByDepartmentIdInAndStatus(
        departmentIds, AppConstants.STATUS_ACTIVE);

  }

  /**
   * Tìm kiếm người dùng với phân quyền theo phòng ban.
   * - Admin: tìm kiếm toàn bộ hệ thống
   * - Người dùng thường: tìm kiếm trong phòng ban và phòng ban con
   */
  @Override
  public Page<User> searchAll(Long did, String uid, UserFilter filter, Pageable pageable){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("1")) {
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
      Department currentDepartment = (Department) departmentService.getById(uid, did);
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

  /**
   * Lấy danh sách người dùng trong phòng ban cha.
   * - Admin: xem tất cả người dùng
   * - Người dùng thường: xem người dùng trong phòng ban cha
   */
  @Override
  public List<User> listUserParentDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("1")) {
      return userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }
    Department department = (Department) departmentService.getById(uid, user.getDepartmentId());

    return userRepo.findByDepartmentIdAndStatus(department.getParentId(), AppConstants.STATUS_ACTIVE);
  }

  @Override
  public List<User> listUserByDep(String uid, Long departmentId){
    return userRepo.findByDepartmentIdAndStatus(departmentId, AppConstants.STATUS_ACTIVE);
  }

  @Override
  public List<User> allUser(String uid){
    return userRepo.findAllByStatus(1);
  }

  /**
   * Lấy danh sách trưởng phòng các phòng ban con.
   * - Admin: xem tất cả trưởng phòng
   * - Người dùng thường: xem trưởng phòng các phòng ban con
   */
  @Override
  public List<User> listHeadChildDep(String uid){
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("1")) {
      return userRepo.findAllByPositionIdAndStatus(AppConstants.POSITION_HEAD, AppConstants.STATUS_ACTIVE);
    }

    List<Department> departments = departmentService.getAllSubDepartments(user.getDepartmentId());

    List<Long> departmentIds = departments.stream()
        .map(Department::getId)
        .collect(Collectors.toList());

    return userRepo.findByDepartmentIdInAndPositionIdAndStatus(
        departmentIds, AppConstants.POSITION_HEAD, AppConstants.STATUS_ACTIVE);

  }

  /**
   * Lấy tên hiển thị của người dùng theo ID.
   * @param userId ID người dùng
   * @return Tên người dùng hoặc ID nếu không tìm thấy
   */
  @Override
  public String getUserDisplayName(String userId) {
    User user = userRepo.findById(Long.valueOf(userId))
            .orElse(null);
    return user != null ? user.getName() : userId;
  }

  /**
   * Xóa người dùng với kiểm tra ràng buộc nghiệp vụ.
   * Không cho phép xóa nếu người dùng đang:
   * - Quản lý dự án đang thực hiện
   * - Phụ trách dự án đang thực hiện  
   * - Được giao công việc đang thực hiện
   */
  @Override
  public void delete(String uid, Long id) {

    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("1")) {
      throw new RuntimeException("Không thể xóa admin");
    }
    // Kiểm tra user có phải người quản lý dự án đang thực hiện không
    boolean hasActiveProjects = projectRepo.existsByManagerIdAndState(
        id.toString(), 
        AppConstants.STATUS_IN_PROGRESS
    );
    if (hasActiveProjects) {
      throw new RuntimeException("Không thể xóa người dùng đang quản lý dự án đang thực hiện");
    }

    // Kiểm tra user có phải người được giao task đang thực hiện không
    boolean hasActiveTasks = taskRepo.existsByAssigneeIdAndStateAndStatus(
        id.toString(),
        AppConstants.STATUS_IN_PROGRESS,
        1
    );
    if (hasActiveTasks) {
      throw new RuntimeException("Không thể xóa người dùng đang được giao task đang thực hiện");
    }

    // Nếu không có ràng buộc thì thực hiện xóa
    super.delete(uid, id);
  }

  @Override
  public List<User> getAll(Long did, String uid) {
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole().equals("1")) {
      return userRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    } else {
      List<Department> departments = new ArrayList<>();
      Department currentDepartment = (Department) departmentService.getById(uid, did);
      departments.add(currentDepartment);
      departments.addAll(departmentService.getAllSubDepartments(did));

      List<Long> departmentIds = departments.stream()
          .map(Department::getId)
          .collect(Collectors.toList());

      return userRepo.findByDepartmentIdInAndStatus(departmentIds, AppConstants.STATUS_ACTIVE);
    }
  }
}
