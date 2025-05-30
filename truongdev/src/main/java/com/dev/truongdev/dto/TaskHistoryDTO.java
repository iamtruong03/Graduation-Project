package com.dev.truongdev.dto;

import lombok.Data;
import java.util.Date;

@Data
public class TaskHistoryDTO {
    private Long id;
    private Long taskId;
    private Integer previousState;
    private Integer newState;
    private String changedBy;
    private Date changedAt;
    private String comment;
    private String changedByName; // Tên người thay đổi
    private String stateName; // Tên trạng thái
} 