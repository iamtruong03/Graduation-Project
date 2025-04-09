package com.dev.truongdev.xdevbase.api;

import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FieldDefaults(level = AccessLevel.PROTECTED)
public abstract  class XDevBaseAPI<E extends XDevBaseEntity> {

  public abstract <S extends IXDevBaseService<E>> S getService();

  @PostMapping("")
  ResponseEntity<ApiResponse<E>> create(
      @RequestHeader(name = "cid", defaultValue = "0") Long cid,
      @RequestHeader(name = "uid", defaultValue = "") String uid,
      @RequestBody E request
  ) {
    try {
      return ApiResponse.ok(getService().create(cid, uid, request));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping("/list")
  ResponseEntity<ApiResponse<List<E>> > getList(
      @RequestHeader(name = "cid", defaultValue = "0") Long cid,
      @RequestHeader(name = "uid", defaultValue = "") String uid
  ) {
    try {
      return ApiResponse.ok(getService().getAll(cid, uid));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @PutMapping("/update")
  ResponseEntity<ApiResponse<E>> update(
      @RequestHeader(name = "cid", defaultValue = "0") Long cid,
      @RequestHeader(name = "uid", defaultValue = "") String uid,
      @RequestBody E request,
      @RequestParam(name = "id") Long id
  ) {
    try {
      return ApiResponse.ok(getService().update(cid, uid, request, id));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @DeleteMapping("/delete")
  ResponseEntity<ApiResponse<String>> delete(
      @RequestHeader(name = "cid", defaultValue = "0") Long cid,
      @RequestHeader(name = "uid", defaultValue = "") String uid,
      @RequestParam(name = "id") Long id
  ) {
    try {
      getService().delete(cid,uid, id);
      return ApiResponse.ok("Deleted");
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @PostMapping("/change-status")
  public ResponseEntity<ApiResponse<String>> changeStatus(
      @RequestHeader(name = "cid", defaultValue = "0") Long cid,
      @RequestHeader(name = "uid", defaultValue = "") String uid,
      @RequestParam(name = "id") Long id
  ) {
    try {
      getService().changeStatus(cid,uid, id);
      return ApiResponse.ok("Delete");
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }
}
