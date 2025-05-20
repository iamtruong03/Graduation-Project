package com.dev.truongdev.payload.filter;

import com.dev.truongdev.xdevbase.dto.XDevBaseFilter;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RiskFilter extends XDevBaseFilter {
    Long projectId;
    Long riskTypeId;
    Integer state;
    Integer impactLevelId;
    String reflectorId;
} 