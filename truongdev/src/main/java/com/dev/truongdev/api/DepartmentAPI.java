package com.dev.truongdev.api;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.payload.filter.DepartmentFilter;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("department")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentAPI extends XDevBaseAPI<Department, DepartmentFilter> {

  final IDepartmentService departmentService;

  @SuppressWarnings("unchecked")
  public IXDevBaseService<Department, DepartmentFilter> getService(){
    return departmentService;
  }

  @GetMapping("/active")
  public ResponseEntity<List<Department>> getActiveDepartments(
      @RequestAttribute String uid
  ) {
    return ResponseEntity.ok(departmentService.getActiveDepartments(uid));
  }

}
