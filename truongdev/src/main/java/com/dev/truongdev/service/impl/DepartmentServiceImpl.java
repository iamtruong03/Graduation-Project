package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentServiceImpl extends
    XDevBaseServiceImpl<Department, DepartmentRepo> implements
    IDepartmentService {

  final DepartmentRepo departmentRepo;
  final UserRepo userRepo;

  public DepartmentServiceImpl(DepartmentRepo repo, UserRepo userRepo) {
    super(repo);
    this.departmentRepo = repo;
    this.userRepo = userRepo;
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
  public List<Department> getAll(Long id, String uid) {
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Kiểm tra điều kiện xem toàn hệ thống (admin hoặc phòng ban root)
    if (user.getRole().equals("ROLE_ADMIN") ||
        (departmentRepo.findById(id).get().getParentId() == null)) {
      return departmentRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }

    Department department = departmentRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("Department not found"));

    List<Department> list = new ArrayList<>();
    list.add(department);
    list.addAll(getAllSubDepartments(id));

    return list;
  }



}
