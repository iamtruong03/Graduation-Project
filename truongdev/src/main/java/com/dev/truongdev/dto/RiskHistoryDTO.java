package com.dev.truongdev.dto;

import lombok.Data;
import java.util.Date;

@Data
public class RiskHistoryDTO {
    private Long id;
    private Long riskId;
    private Integer previousState;
    private Integer newState;
    private String changedBy;
    private Date changedAt;
    private String comment;
    private String changedByName;
    private String stateName;
} 