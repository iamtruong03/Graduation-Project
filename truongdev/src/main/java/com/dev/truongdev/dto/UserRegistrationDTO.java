package com.dev.truongdev.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Data
@Setter
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRegistrationDTO {
    Long id;

    String code;

    String name;

    Long departmentId;
    Long positionId;

    String phoneNumber;

    @Email(message = "Email không hợp lệ")
    String email;

    String password;

    String role;
    String address;
    String gender;
}