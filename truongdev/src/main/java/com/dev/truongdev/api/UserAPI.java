package com.dev.truongdev.api;

import com.dev.truongdev.entity.User;
import com.dev.truongdev.service.impl.UserServiceImpl;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
