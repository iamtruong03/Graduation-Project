package com.dev.truongdev.service;

import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import com.dev.truongdev.dto.RiskDTO;
import com.dev.truongdev.dto.RiskHistoryDTO;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IRiskService extends IXDevBaseService<Risk, RiskFilter> {

    RiskDTO updateRisk(Long id, RiskDTO riskDTO);
    List<RiskHistoryDTO> getRiskHistory(Long riskId);
    void addRiskHistory(Long riskId, Integer previousState, Integer newState, String changedBy, String comment);
    
    // Add approval flow methods
    RiskDTO createRisk(String uid, RiskDTO riskDTO);
    RiskDTO submitForApproval(String uid, Long id, List<Long> approverIds);
    RiskDTO approveRisk(String uid, Long id, String approvedBy);
    RiskDTO rejectRisk(String uid, Long id, String reason);
    void checkAndUpdateRiskStatus(Long riskId);
    Page<Risk> getPendingApprovalRisks(String approverId, RiskFilter filter, Pageable pageable);
} 