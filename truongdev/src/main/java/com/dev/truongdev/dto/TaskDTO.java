package com.dev.truongdev.dto;

import lombok.Data;
import java.util.Date;

@Data
public class TaskDTO {
    private Long id;
    private String code;
    private String name;
    private Integer state;
    private Long departmentId;
    private Long projectId;
    private Integer priorityId;
    private Date startDate;
    private Date dueDate;
    private Date completedDate;
    private String assigneeId;
    private String approverId;
    private String updateBy;
    private String description;
    private String comment;
    
    // Additional fields for UI display
    private String departmentName;
    private String projectName;
    private String priorityName;
    private String assigneeName;
    private String approverName;
    private String stateName;
} 