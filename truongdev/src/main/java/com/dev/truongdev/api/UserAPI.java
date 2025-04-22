package com.dev.truongdev.api;
import com.dev.truongdev.dto.UserRegistrationDTO;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.service.impl.UserServiceImpl;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAPI extends XDevBaseAPI<User> {

  final UserServiceImpl userService;

  @SuppressWarnings("unchecked")
  public IXDevBaseService<User> getService(){
    return userService;
  }

  @PostMapping("/register")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Long> registerUser(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
    try {
      Long userId = userService.registerNewUser(registrationDTO);
      return ResponseEntity.status(HttpStatus.CREATED).body(userId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @GetMapping("/check-first-admin")
  @PreAuthorize("permitAll()")
  public ResponseEntity<Boolean> checkFirstAdmin() {
    return ResponseEntity.ok(!userService.hasAdmin());
  }

  @PostMapping("/register/first-admin")
  @PreAuthorize("permitAll()")
  public ResponseEntity<Long> registerFirstAdmin(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
    try {
      // Kiểm tra xem đã có admin trong hệ thống chưa
      if (userService.hasAdmin()) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
      }

      // Tự động gán quyền ADMIN cho người dùng đầu tiên
      registrationDTO.setRole("ROLE_ADMIN");
      Long userId = userService.registerNewUser(registrationDTO);

      return ResponseEntity.status(HttpStatus.CREATED).body(userId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().build();
    }
  }
}
