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
public class Project extends XDevBaseEntity {

    // Loại dự án (development, research, etc.)
    @Column(name = "project_type_id", length = 30)
    Long projectTypeId;

    // Trạng thái dự án
    @Column(name = "state")
    Integer state;

    // Phòng ban phụ trách
    @Column(name = "department_id", length = 30)
    Long departmentId;

    // Ngày bắt đầu
    @Column(name = "start_date", nullable = false)
    Date startDate;

    // Ngày kết thúc dự kiến
    @Column(name = "deadline")
    Date deadline;

    // Ngày kết thúc thực tế
    @Column(name = "actual_end_date")
    Date actualEndDate;

    // Mức độ ưu tiên (1: Low, 2: Medium, 3: High)
    @Column(name = "priority_id")
    Integer priorityId;

    // Người phê duyệt
    @Column(name = "approver_id")
    String approverId;

    // Danh sách người chịu trách nhiệm
    @Column(name = "responsible_ids", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    List<String> responsibleIds;

    // Người quản lý dự án
    @Column(name = "manager_id")
    String managerId;

    // Tiến độ dự án (%)
    @Column(name = "progress")
    Integer progress;

}
