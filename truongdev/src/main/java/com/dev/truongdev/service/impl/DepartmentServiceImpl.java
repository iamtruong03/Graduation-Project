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

  public Department createRootDepartment() {
    Department rootDepartment = new Department();
    rootDepartment.setName("Root Department");
    rootDepartment.setCode("ROOT");
    rootDepartment.setParentId(null);
    rootDepartment.setDescription("Phòng ban gốc của hệ thống");
    return departmentRepo.save(rootDepartment);
  }

  public Department getRootDepartment() {
    return departmentRepo.findByCode("ROOT").orElseGet(this::createRootDepartment);
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
