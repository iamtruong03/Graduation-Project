package com.dev.truongdev.dto;

import lombok.Data;
import java.util.Date;

@Data
public class RiskDTO {
    private Long id;
    private String code;
    private String name;
    private Integer state;
    private Long riskTypeId;
    private Long projectId;
    private Long taskId;
    private Long departmentId;
    private Integer impactLevelId;
    private Integer scopeId;
    private Integer possibilityId;
    private Integer priorityId;
    private String reflectorId;
    private String approverId;
    private String rootCause;
    private String impactAnalysis;
    private String remedy;
    private String precautions;
    private Date reflectionDay;
    private String description;
    private String updateBy;
    private Integer status;
    private String comment;
    
    // Impact and probability fields
    private Integer impact;
    private Integer probability;
    private String mitigation;
    
    // Additional fields for UI display
    private String riskTypeName;
    private String projectName;
    private String impactLevelName;
    private String scopeName;
    private String reflectorName;
    private String approverName;
    private String stateName;
} 