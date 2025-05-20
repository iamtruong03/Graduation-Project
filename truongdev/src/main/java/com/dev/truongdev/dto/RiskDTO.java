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
    private Integer impactLevelId;
    private Integer scopeId;
    private String reflectorId;
    private Date reflectionDay;
    private String updateBy;
    
    // Additional fields for UI display
    private String riskTypeName;
    private String projectName;
    private String impactLevelName;
    private String scopeName;
    private String reflectorName;
    private String stateName;
} 