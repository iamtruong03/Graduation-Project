package com.dev.truongdev.payload.filter;

import com.dev.truongdev.xdevbase.dto.XDevBaseFilter;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class TaskFilter extends XDevBaseFilter {
    private String search;
    private Long departmentId;
    private Long projectId;
    private Integer priorityId;
    private String assigneeId;
    private String approverId;
    private Integer state;
} 