package com.dev.truongdev.payload.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class UpdatePasswordRequest {
  private String code;
  private String password;
  private String newPassword;
}
