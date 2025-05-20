package com.dev.truongdev.entity;

import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.util.Date;
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
public class Task extends XDevBaseEntity {
    // Trạng thái công việc
    @Column(name = "state")
    Integer state;

    // Phòng ban phụ trách
    @Column(name = "department_id")
    Long departmentId;

    // Dự án liên quan
    @Column(name = "project_id")
    Long projectId;

    // Độ ưu tiên (1: Low, 2: Medium, 3: High)
    @Column(name = "priority_id")
    Integer priorityId;

    // Ngày bắt đầu
    @Column(name = "start_date")
    Date startDate;

    // Ngày kết thúc dự kiến
    @Column(name = "due_date")
    Date dueDate;

    // Ngày hoàn thành thực tế
    @Column(name = "completed_date")
    Date completedDate;

    // Người được giao/ thực hiện
    @Column(name = "assignee_id")
    String assigneeId;

    // Người phê duyệt
    @Column(name = "approver_id")
    String approverId;
}
