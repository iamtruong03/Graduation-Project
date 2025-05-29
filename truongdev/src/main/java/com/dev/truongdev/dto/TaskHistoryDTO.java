package com.dev.truongdev.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.util.Date;

@Data
@Getter
@Setter
public class TaskHistoryDTO {
    private Long id;
    private Long taskId;
    private Integer previousState;
    private Integer newState;
    private String changedBy;
    private Date changedAt;
    private String comment;
    
    // Additional fields for UI display
    private String previousStateName;
    private String stateName;
    private String changedByName;
} 