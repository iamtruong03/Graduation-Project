package com.dev.truongdev.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class ProjectDTO {
    // Basic fields from XDevBaseEntity
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer status;
    private Date createDate;
    private Date modifiedDate;
    private String createBy;
    private String updateBy;

    // Project specific fields
    Integer projectTypeId;
    private Long departmentId;
    private Date startDate;
    private Date endDate;
    private Integer state;
    private Boolean isApproved;
    
    // Approval fields
    private String approverId;
    
    // Management fields
    private String managerId;
    private List<String> responsibleIds;

    // Progress tracking
    private Integer completedTasks;
    private Integer totalTasks;
    private Double progressPercentage;
} 