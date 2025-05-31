package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.filter.DepartmentFilter;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.repo.TaskRepo;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentServiceImpl extends
    XDevBaseServiceImpl<Department,DepartmentFilter, DepartmentRepo> implements
    IDepartmentService<Department, DepartmentFilter> {

  final DepartmentRepo departmentRepo;
  final UserRepo userRepo;
  final ProjectRepo projectRepo;
  final TaskRepo taskRepo;

  public DepartmentServiceImpl(DepartmentRepo repo, UserRepo userRepo, 
                             ProjectRepo projectRepo, TaskRepo taskRepo) {
    super(repo);
    this.departmentRepo = repo;
    this.userRepo = userRepo;
    this.projectRepo = projectRepo;
    this.taskRepo = taskRepo;
  }

  @Override
  public void delete(String uid, Long id) {
    // Kiểm tra phòng ban có dự án đang thực hiện không
    boolean hasActiveProjects = projectRepo.existsByDepartmentIdAndState(
        id,
        AppConstants.STATUS_IN_PROGRESS
    );
    if (hasActiveProjects) {
      throw new RuntimeException("Không thể xóa phòng ban đang có dự án đang thực hiện");
    }

    // Kiểm tra phòng ban có task đang thực hiện không
    boolean hasActiveTasks = taskRepo.existsByDepartmentIdAndStateAndStatus(
        id,
        AppConstants.STATUS_IN_PROGRESS,
        1
    );
    if (hasActiveTasks) {
      throw new RuntimeException("Không thể xóa phòng ban đang có task đang thực hiện");
    }

    // Kiểm tra các phòng ban con
    List<Department> subDepartments = getAllSubDepartments(id);
    for (Department subDept : subDepartments) {
      hasActiveProjects = projectRepo.existsByDepartmentIdAndState(
          subDept.getId(),
          AppConstants.STATUS_IN_PROGRESS
      );
      if (hasActiveProjects) {
        throw new RuntimeException("Không thể xóa phòng ban có phòng ban con đang có dự án đang thực hiện");
      }

      hasActiveTasks = taskRepo.existsByDepartmentIdAndStateAndStatus(
          subDept.getId(),
          AppConstants.STATUS_IN_PROGRESS,
          1
      );
      if (hasActiveTasks) {
        throw new RuntimeException("Không thể xóa phòng ban có phòng ban con đang có task đang thực hiện");
      }
    }

    // Nếu không có ràng buộc thì thực hiện xóa
    super.delete(uid, id);
  }

  // lấy phòng ban con, cháu, chắt
  @Override
  public List<Department> getAllSubDepartments(Long id) {
    List<Department> list = new ArrayList<>();
    Queue<Long> queue = new LinkedList<>();
    queue.add(id);

    while (!queue.isEmpty()) {
      Long currentId = queue.poll();
      List<Department> children = departmentRepo.findByParentIdAndStatus(currentId, AppConstants.STATUS_ACTIVE);
      list.addAll(children);

      for (Department dept : children) {
        queue.add(dept.getId());
      }
    }
    return list;
  }

  // lấy phòng ban hiện tại + con cháu...
  @Override
  public List<Department> getAll(Long did, String uid) {
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Kiểm tra điều kiện xem toàn hệ thống (admin hoặc phòng ban root)
    if (user.getRole().equals("1") ||
        (departmentRepo.findById(did).get().getParentId() == null)) {
      return departmentRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }

    Department department = departmentRepo.findById(did)
        .orElseThrow(() -> new RuntimeException("Department not found"));

    List<Department> list = new ArrayList<>();
    list.add(department);
    list.addAll(getAllSubDepartments(did));

    return list;
  }

  // Lấy danh sách phòng ban đang hoạt động với thông tin cơ bản
  @Override
  public List<Department> getActiveDepartments(String uid) {
    return departmentRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
  }

  // lấy phòng ban hiện tại + con cháu...
  @Override
  public Page<Department> searchAll(Long did, String uid, DepartmentFilter filter, Pageable pageable) {
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    Page<Department> page;

    // Kiểm tra điều kiện xem toàn hệ thống (admin hoặc phòng ban root)
    if (user.getRole().equals("1") ||
        (departmentRepo.findById(did).get().getParentId() == null)) {
        List<Department> allDepartments = departmentRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);

        page = departmentRepo.searchByCodeOrName(AppConstants.STATUS_ACTIVE,  filter.getSearch(), allDepartments, pageable);

    } else {
      Department department = departmentRepo.findById(did)
          .orElseThrow(() -> new RuntimeException("Department not found"));

      List<Department> list = new ArrayList<>();
      list.add(department);
      list.addAll(getAllSubDepartments(did));

      page = departmentRepo.searchByCodeOrName(AppConstants.STATUS_ACTIVE, filter.getSearch(), list, pageable);
    }

    return page;
  }

}
