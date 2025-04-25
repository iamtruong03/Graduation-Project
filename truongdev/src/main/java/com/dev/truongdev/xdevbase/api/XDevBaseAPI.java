package com.dev.truongdev.xdevbase.api;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FieldDefaults(level = AccessLevel.PROTECTED)
public abstract class XDevBaseAPI<E extends XDevBaseEntity> {

  public abstract <S extends IXDevBaseService<E>> S getService();

  @PostMapping("")
  ResponseEntity<ApiResponse<E>> create(
      @RequestAttribute String uid,
      @RequestBody E request
  ) {
    try {
      return ApiResponse.ok(getService().create(uid, request));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping("/{id}")
  ResponseEntity<ApiResponse<E> > getId(
      @RequestAttribute String uid,
      @PathVariable Long id
  ) {
    try {
      return ApiResponse.ok(getService().getById(uid, id));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @PostMapping("search")
  ResponseEntity<ApiResponse<Page<E>>> searchEmissionFactor(
      @RequestAttribute Long did,
      @RequestAttribute String uid,
      @RequestParam(name = "search") String search,
      @PageableDefault(size = 10) Pageable pageable
  ) {
    try {
      return ApiResponse.ok(getService().searchAll(did, uid, search, pageable));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @PutMapping("/update/{id}")
  ResponseEntity<ApiResponse<E>> update(
      @RequestAttribute String uid,
      @RequestBody E request,
      @PathVariable Long id
  ) {
    try {
      return ApiResponse.ok(getService().update(uid, request, id));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @DeleteMapping("/delete/{id}")
  ResponseEntity<ApiResponse<String>> delete(
      @RequestAttribute String uid,
      @PathVariable Long id
  ) {
    try {
      getService().delete(uid, id);
      return ApiResponse.ok("Deleted");
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @PostMapping("/change-status/{id}")
  public ResponseEntity<ApiResponse<String>> changeStatus(
      @RequestAttribute String uid,
      @PathVariable Long id
  ) {
    try {
      getService().changeStatus(uid, id);
      return ApiResponse.ok("Status changed successfully");
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }
}
