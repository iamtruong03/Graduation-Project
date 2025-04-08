package com.truongdev.entity.Plan;

import com.truongdev.utils.StringListConverter;
import com.truongdev.xdevbase.entity.BaseEntity;
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
public class Plan extends BaseEntity {
  // Don vi ghi nhan
  @Column(name = "org_id", nullable = false)
  Long orgId;
  @Column(name = "plan_type_id", length = 30)
  Long planTypeId;

  // Pham vi
  @Column(name = "scope_id", length = 30)
  Long scopeId;

  @Column(name = "department_id", length = 30)
  Long departmentId;

  // Ngay phat sinh
  @Column(name = "occurrence_date", nullable = false)
  Date occurrenceDate;

  // Han hoan thanh
  @Column(name = "deadline")
  Date deadline;

  @Column(name = "responsible_ids", columnDefinition = "TEXT")
  @Convert(converter = StringListConverter.class)
  List<String> responsibleIds;
}
