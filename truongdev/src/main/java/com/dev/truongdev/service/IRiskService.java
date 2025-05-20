package com.dev.truongdev.service;

import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.RiskDTO;
import com.dev.truongdev.dto.RiskHistoryDTO;
import java.util.List;

public interface IRiskService extends IXDevBaseService<Risk, RiskFilter> {
    RiskDTO getRiskById(Long id);
    RiskDTO updateRisk(Long id, RiskDTO riskDTO);
    List<RiskHistoryDTO> getRiskHistory(Long riskId);
    void addRiskHistory(Long riskId, Integer previousState, Integer newState, String changedBy, String comment);
} 