package com.dev.truongdev.api;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("department")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentAPI extends XDevBaseAPI<Department> {

  final IXDevBaseService<Department> service;

  @SuppressWarnings("unchecked")
  public IXDevBaseService<Department> getService(){
    return service;
  }
}
