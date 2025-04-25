package com.dev.truongdev.service;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;
import java.util.Map;

public interface IDepartmentService extends IXDevBaseService<Department> {
  // lấy phòng ban con, cháu, chắt
  List<Department> getAllSubDepartments(Long id);

}
