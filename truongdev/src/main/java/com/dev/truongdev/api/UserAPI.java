package com.dev.truongdev.api;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.filter.UserFilter;
import com.dev.truongdev.payload.request.UpdatePasswordRequest;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAPI extends XDevBaseAPI<User, UserFilter> {

  final IUserService userService;

  @SuppressWarnings("unchecked")
  public IXDevBaseService<User, UserFilter> getService(){
    return userService;
  }

  @GetMapping("/update-password")
  ResponseEntity<ApiResponse<String>> updatePassword(
      @RequestAttribute String uid,
      @RequestBody UpdatePasswordRequest updatePasswordRequest
  ) {
    try {
      userService.updatePassword(uid, updatePasswordRequest);
      return ApiResponse.ok("Update password success");
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping("/list-user-dep")
  ResponseEntity<ApiResponse<List<User>>> listUserDep(
      @RequestAttribute String uid
  ) {
    try {
      return ApiResponse.ok(userService.listUserDep(uid));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping("/list-user-child-dep")
  ResponseEntity<ApiResponse<List<User>>> listUserChildDep(
      @RequestAttribute String uid
  ) {
    try {
      return ApiResponse.ok(userService.listUserChildDep(uid));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping("/list-user-parent-dep")
  ResponseEntity<ApiResponse<List<User>>> listUserParentDep(
      @RequestAttribute String uid
  ) {
    try {
      return ApiResponse.ok(userService.listUserParentDep(uid));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping("/list-head-child-dep")
  ResponseEntity<ApiResponse<List<User>>> listHeadChildDep(
      @RequestAttribute String uid
  ) {
    try {
      return ApiResponse.ok(userService.listHeadChildDep(uid));
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }

  @GetMapping("/current-user")
  ResponseEntity<ApiResponse<User>> getCurrentUser(@RequestAttribute String uid) {
    try {
      User currentUser = getService().getById(uid, Long.parseLong(uid));
      return ApiResponse.ok(currentUser);
    } catch (Exception e) {
      return ApiResponse.error(e.getMessage());
    }
  }
}
