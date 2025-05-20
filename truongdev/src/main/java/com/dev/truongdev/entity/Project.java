package com.dev.truongdev.entity;

import com.dev.truongdev.dto.ProjectDTO;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.Date;
import java.util.List;
import org.springframework.beans.BeanUtils;

@Entity
@Table(name = "project")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Project extends XDevBaseEntity {

    Integer projectTypeId;

    // Phòng ban phụ trách
    @Column(name = "department_id")
    Long departmentId;
    
    @Column(name = "start_date")
    Date startDate;
    
    @Column(name = "end_date")
    Date endDate;
    
    @Column(name = "state")
    Integer state;
    
    @Column(name = "is_approved")
    Boolean isApproved;

    // Additional fields for legacy support
    @Column(name = "approver_id")
    String approverId;
    
    @Column(name = "manager_id")
    String managerId;
    
    @Column(name = "responsible_ids")
    List<String> responsibleIds;

    public ProjectDTO toDTO() {
        ProjectDTO dto = new ProjectDTO();
        BeanUtils.copyProperties(this, dto);
        return dto;
    }
}
