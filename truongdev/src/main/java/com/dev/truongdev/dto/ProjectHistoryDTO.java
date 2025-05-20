package com.dev.truongdev.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ProjectHistoryDTO {
    private Long id;
    private Long projectId;
    private Integer previousState;
    private Integer newState;
    private String changedBy;
    private Date changedAt;
    private String comment;
    private String changedByName;
    private String stateName;
} 