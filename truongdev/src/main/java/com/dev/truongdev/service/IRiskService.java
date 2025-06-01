package com.dev.truongdev.service;

import com.dev.truongdev.dto.RiskDTO;
import com.dev.truongdev.dto.RiskHistoryDTO;
import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IRiskService extends IXDevBaseService<Risk, RiskFilter> {

    RiskDTO updateRisk(String uid, Long id, RiskDTO riskDTO);
    void changeStatus(String uid, Long id);
    Page<Risk> searchAll(Long departmentId, String uid, RiskFilter filter, Pageable pageable);
    void addRiskHistory(Long riskId, Integer previousState, Integer newState, String changedBy, String comment);
    List<RiskHistoryDTO> getRiskHistory(Long riskId);
    String getRiskNameById(Long id);
} 