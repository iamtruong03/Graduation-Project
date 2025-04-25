package com.dev.truongdev.api;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("department")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentAPI extends XDevBaseAPI<Department> {

  final IXDevBaseService<Department> service;

  final IDepartmentService iDepartmentService;

  @SuppressWarnings("unchecked")
  public IXDevBaseService<Department> getService(){
    return service;
  }

  @GetMapping("/getall")
  ResponseEntity<ApiResponse<List<Department>>> getList(
      @RequestHeader(name = "did") Long did
  ) {
    try {
      return ApiResponse.ok(iDepartmentService.getDepartmentList(did));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  }
