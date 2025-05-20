package com.dev.truongdev.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class ProjectDTO {
    private Long id;
    private String code;
    private String name;
    private Long projectTypeId;
    private Integer state;
    private Long departmentId;
    private Date startDate;
    private Date deadline;
    private Date actualEndDate;
    private Integer priorityId;
    private String approverId;
    private List<String> responsibleIds;
    private String managerId;
    private Integer progress;
    private String updateBy;
    
    // Additional fields for UI display
    private String projectTypeName;
    private String departmentName;
    private String priorityName;
    private String approverName;
    private String managerName;
    private String stateName;
    private List<String> responsibleNames;
} 