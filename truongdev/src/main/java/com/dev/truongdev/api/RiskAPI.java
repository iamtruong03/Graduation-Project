package com.dev.truongdev.api;

import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.entity.RiskHistory;
import com.dev.truongdev.dto.RiskHistoryDTO;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.repo.RiskHistoryRepo;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Date;

@RestController
@RequestMapping("risk")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RiskAPI extends XDevBaseAPI<Risk, RiskFilter> {

  final IXDevBaseService<Risk, RiskFilter> service;
  final RiskHistoryRepo riskHistoryRepo;

  @SuppressWarnings("unchecked")
  public IXDevBaseService<Risk, RiskFilter> getService(){
    return service;
  }

  @GetMapping("/{id}/history")
  public ResponseEntity<List<RiskHistoryDTO>> getRiskHistory(@PathVariable Long id) {
    List<RiskHistory> histories = riskHistoryRepo.findByRiskIdOrderByChangedAtDesc(id);
    List<RiskHistoryDTO> dtos = histories.stream().map(history -> {
      RiskHistoryDTO dto = new RiskHistoryDTO();
      dto.setId(history.getId());
      dto.setRiskId(history.getRiskId());
      dto.setPreviousState(history.getPreviousState());
      dto.setNewState(history.getNewState());
      dto.setChangedBy(history.getChangedBy());
      dto.setChangedAt(history.getChangedAt());
      dto.setComment(history.getComment());
      // TODO: Cần thêm logic để lấy tên người thay đổi và tên trạng thái
      return dto;
    }).toList();
    return ResponseEntity.ok(dtos);
  }

  @PostMapping("/{id}/history")
  public ResponseEntity<Void> addRiskHistory(
      @PathVariable Long id,
      @RequestParam Integer previousState,
      @RequestParam Integer newState,
      @RequestParam String changedBy,
      @RequestParam(required = false) String comment) {
    
    RiskHistory history = RiskHistory.builder()
        .riskId(id)
        .previousState(previousState)
        .newState(newState)
        .changedBy(changedBy)
        .changedAt(new Date())
        .comment(comment)
        .build();
    
    riskHistoryRepo.save(history);
    return ResponseEntity.ok().build();
  }
} 