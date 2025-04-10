package com.dev.truongdev.api;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAPI extends XDevBaseAPI<User> {

  final IUserService userService;

  @SuppressWarnings("unchecked")
  public IXDevBaseService<User> getService(){
    return userService;
  }

  @PostMapping("/register")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<User> register(@Valid @RequestBody User user) {
    if (user.getDepartmentId() == null || user.getPositionId() == null || 
        user.getPhoneNumber() == null || user.getEmail() == null) {
      return ResponseEntity.badRequest().build();
    }
    
    User savedUser = userService.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
  }
}
