package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentServiceImpl extends
    XDevBaseServiceImpl<Department, DepartmentRepo> implements
    IDepartmentService {

  final DepartmentRepo departmentRepo;

  public DepartmentServiceImpl(DepartmentRepo repo) {
    super(repo);
    this.departmentRepo = repo;
  }

  public boolean isParentOrAncestorOf(Long parentDepartmentId, Long childDepartmentId) {
    if (parentDepartmentId == null || childDepartmentId == null) {
      return false;
    }
    
    Department childDepartment = departmentRepo.findById(childDepartmentId).orElse(null);
    if (childDepartment == null) {
      return false;
    }

    Long currentParentId = childDepartment.getParentId();
    while (currentParentId != null) {
      if (currentParentId.equals(parentDepartmentId)) {
        return true;
      }
      Department currentParent = departmentRepo.findById(currentParentId).orElse(null);
      if (currentParent == null) {
        break;
      }
      currentParentId = currentParent.getParentId();
    }
    
    return false;
  }
}
