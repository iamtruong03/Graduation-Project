package com.dev.truongdev.entity;

import com.dev.truongdev.dto.UserRegistrationDTO;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import jakarta.persistence.Entity;
import java.time.LocalDate;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User extends XDevBaseEntity {
  Long departmentId;

  Long positionId;

  String  phoneNumber;

  String email;

  LocalDate startDate;

  LocalDate birthday;

  String password;

  String role;

  String address;

  String gender;

  public UserRegistrationDTO toDTO() {
      UserRegistrationDTO dto = new UserRegistrationDTO();
      dto.setDepartmentId(departmentId);
      dto.setPositionId(positionId);
      dto.setPhoneNumber(phoneNumber);
      dto.setEmail(email);
      dto.setAddress(address);
      dto.setGender(gender);
      dto.setRole(role);
      dto.setPassword(password);
      return dto;
  }
}
