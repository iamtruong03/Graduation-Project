package com.dev.truongdev.entity;

import com.dev.truongdev.utils.StringListConverter;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import java.util.Date;
import java.util.List;
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
public class Project extends XDevBaseEntity{

  // loai du an
  @Column(name = "project_type_id", length = 30)
  Long projectTypeId;

  // Pham vi
  @Column(name = "scope_id", length = 30)
  Long scopeId;

//  @Column(name = "department_id", length = 30)
//  Long departmentId;

  // Ngay bat dau
  @Column(name = "occurrence_date", nullable = false)
  Date occurrenceDate;

  // Ngay ket thuc
  @Column(name = "deadline")
  Date deadline;

  // nguoi phe duyet
  @Column(name = "approver_id")
  String approverId;

  // nguoi chiu trach nhiem
  @Column(name = "responsible_ids", columnDefinition = "TEXT")
  @Convert(converter = StringListConverter.class)
  List<String> responsibleIds;
}
