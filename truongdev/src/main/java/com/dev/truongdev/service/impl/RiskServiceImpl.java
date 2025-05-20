package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.RiskDTO;
import com.dev.truongdev.dto.RiskHistoryDTO;
import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.entity.RiskHistory;
import com.dev.truongdev.repo.RiskHistoryRepo;
import com.dev.truongdev.repo.RiskRepo;
import com.dev.truongdev.service.IRiskService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.StateNameUtils;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RiskServiceImpl extends XDevBaseServiceImpl<Risk, RiskFilter, RiskRepo>
        implements IRiskService {

    final RiskRepo riskRepo;
    final RiskHistoryRepo riskHistoryRepository;
    final IUserService userService;

    public RiskServiceImpl(RiskRepo repo, RiskHistoryRepo historyRepo, IUserService userService) {
        super(repo);
        this.riskRepo = repo;
        this.riskHistoryRepository = historyRepo;
        this.userService = userService;
    }

    @Override
    public RiskDTO getRiskById(Long id) {
        Risk risk = riskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));
        return convertToDTO(risk);
    }

    @Override
    @Transactional
    public RiskDTO updateRisk(Long id, RiskDTO riskDTO) {
        Risk risk = riskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));
        
        Integer previousState = risk.getState();
        
        // Update risk fields
        risk.setState(riskDTO.getState());
        risk.setRiskTypeId(riskDTO.getRiskTypeId());
        risk.setProjectId(riskDTO.getProjectId());
        risk.setImpactLevelId(riskDTO.getImpactLevelId());
        risk.setScopeId(riskDTO.getScopeId());
        risk.setReflectorId(riskDTO.getReflectorId());
        risk.setReflectionDay(riskDTO.getReflectionDay());
        
        risk = riskRepo.save(risk);
        
        // Add history if state changed
        if (!previousState.equals(risk.getState())) {
            addRiskHistory(id, previousState, risk.getState(), riskDTO.getUpdateBy(), "Cập nhật trạng thái");
        }
        
        return convertToDTO(risk);
    }

    @Override
    public List<RiskHistoryDTO> getRiskHistory(Long riskId) {
        return riskHistoryRepository.findByRiskIdOrderByChangedAtDesc(riskId)
                .stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void addRiskHistory(Long riskId, Integer previousState, Integer newState, String changedBy, String comment) {
        RiskHistory history = RiskHistory.builder()
                .riskId(riskId)
                .previousState(previousState)
                .newState(newState)
                .changedBy(changedBy)
                .changedAt(new Date())
                .comment(comment)
                .build();
        riskHistoryRepository.save(history);
    }

    private RiskDTO convertToDTO(Risk risk) {
        RiskDTO dto = new RiskDTO();
        dto.setId(risk.getId());
        dto.setCode(risk.getCode());
        dto.setName(risk.getName());
        dto.setState(risk.getState());
        dto.setRiskTypeId(risk.getRiskTypeId());
        dto.setProjectId(risk.getProjectId());
        dto.setImpactLevelId(risk.getImpactLevelId());
        dto.setScopeId(risk.getScopeId());
        dto.setReflectorId(risk.getReflectorId());
        dto.setReflectionDay(risk.getReflectionDay());
        
        // Set display names
        dto.setStateName(StateNameUtils.getRiskStateName(risk.getState()));
        dto.setReflectorName(userService.getUserDisplayName(risk.getReflectorId()));
        
        return dto;
    }

    private RiskHistoryDTO convertHistoryToDTO(RiskHistory history) {
        RiskHistoryDTO dto = new RiskHistoryDTO();
        dto.setId(history.getId());
        dto.setRiskId(history.getRiskId());
        dto.setPreviousState(history.getPreviousState());
        dto.setNewState(history.getNewState());
        dto.setChangedBy(history.getChangedBy());
        dto.setChangedAt(history.getChangedAt());
        dto.setComment(history.getComment());
        
        // Set display names
        dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        dto.setStateName(StateNameUtils.getRiskStateName(history.getNewState()));
        
        return dto;
    }
} 