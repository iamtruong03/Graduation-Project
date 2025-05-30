package com.dev.truongdev.service;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.payload.filter.DepartmentFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;

public interface IDepartmentService<E, F> extends IXDevBaseService<Department, DepartmentFilter> {
  // lấy phòng ban con, cháu, chắt
  List<Department> getAllSubDepartments(Long id);

  // Lấy danh sách phòng ban đang hoạt động với thông tin cơ bản
  List<Department> getActiveDepartments(String uid);
}
