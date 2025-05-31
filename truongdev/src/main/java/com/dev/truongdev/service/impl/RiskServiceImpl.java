package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.RiskDTO;
import com.dev.truongdev.dto.RiskHistoryDTO;
import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.entity.RiskHistory;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.RiskHistoryRepo;
import com.dev.truongdev.repo.RiskRepo;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.service.IRiskService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.utils.StateNameUtils;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.BeanUtils;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.repo.TaskRepo;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service implementation quản lý rủi ro (Risk).
 * Xử lý CRUD operations, chuyển đổi trạng thái và quy trình phê duyệt rủi ro.
 */
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RiskServiceImpl extends XDevBaseServiceImpl<Risk, RiskFilter, RiskRepo>
        implements IRiskService {

    RiskRepo riskRepo;
    RiskHistoryRepo riskHistoryRepo;
    IUserService userService;
    DepartmentRepo departmentRepo;
    IDepartmentService<Department, ?> departmentService;
    UserRepo userRepo;
    ProjectRepo projectRepo;
    TaskRepo taskRepo;

    public RiskServiceImpl(RiskRepo repo, 
                          RiskHistoryRepo historyRepo, 
                          IUserService userService, 
                          DepartmentRepo departmentRepo, 
                          IDepartmentService<Department, ?> departmentService,
                          UserRepo userRepo,
                          ProjectRepo projectRepo,
                          TaskRepo taskRepo) {
        super(repo);
        this.riskRepo = repo;
        this.riskHistoryRepo = historyRepo;
        this.userService = userService;
        this.departmentRepo = departmentRepo;
        this.departmentService = departmentService;
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
        this.taskRepo = taskRepo;
    }

    public void setBaseEntity (Risk e, String uid){
        e.setCreateBy(Optional.ofNullable(e.getCreateBy()).orElse(uid));
        e.setUpdateBy(uid);
        e.setStatus(AppConstants.STATUS_ACTIVE);
    }

    @Override
    @Transactional
    public Risk create(String uid, Risk risk) {

        setBaseEntity(risk, uid);
        risk.setState(AppConstants.STATUS_IN_PROGRESS);

        Risk saved = riskRepo.save(risk);

        addRiskHistory(saved.getId(), null, AppConstants.STATUS_IN_PROGRESS,
            uid, "Tạo mới rủi ro");

        return risk;
    }

    @Override
    @Transactional
    public RiskDTO updateRisk(String uid, Long id, RiskDTO riskDTO) {
        validateRiskDTO(riskDTO);

        Risk currentRisk = riskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found with id: " + id));

        // Kiểm tra quyền cập nhật
        if (!uid.equals(currentRisk.getReflectorId())) {
            throw new RuntimeException("Không có quyền cập nhật");
        }

        Integer previousState = currentRisk.getState();

        validateReferences(riskDTO);
        validateStateTransition(previousState, riskDTO.getState());

        Risk updatedRisk = super.update(riskDTO.getUpdateBy(), convertDTOToEntity(riskDTO, id), id);

        handleStateChange(id, previousState, updatedRisk.getState(), riskDTO);

        return convertToDTO(updatedRisk);
    }


    @Override
    public void changeStatus(String uid, Long id) {
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));

        // Kiểm tra quyền cập nhật
        if (!uid.equals(risk.getReflectorId())) {
            throw new RuntimeException("Không có xóa");
        }

        risk.setStatus(AppConstants.STATUS_INACTIVE);
        risk.setUpdateBy(uid);
        riskRepo.save(risk);
        
        addRiskHistory(id, risk.getState(), risk.getState(), uid, "Xóa risk");
    }


    /**
     * Tìm kiếm rủi ro theo phòng ban, kiểm soát truy cập theo quyền.
     * - Admin và trưởng phòng ban gốc có thể xem tất cả rủi ro
     * - Người dùng khác chỉ xem được rủi ro trong phòng ban và phòng ban con
     */
    @Override
    public Page<Risk> searchAll(Long departmentId, String uid, RiskFilter filter, Pageable pageable) {
        User user = userService.getById(uid, Long.valueOf(uid));

        if (hasFullAccess(user, departmentId)) {
            return riskRepo.searchByCodeOrName(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                filter.getRiskTypeId(),
                filter.getReflectorId(),
                pageable
            );
        }

        List<Long> departmentIds = getDepartmentAndSubDepartmentIds(departmentId);
        return riskRepo.searchByCodeOrNameAndDepartments(
            AppConstants.STATUS_ACTIVE,
            filter.getSearch(),
            departmentIds,
            filter.getRiskTypeId(),
            filter.getReflectorId(),
            pageable
        );
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
        riskHistoryRepo.save(history);
    }

    @Override
    public List<RiskHistoryDTO> getRiskHistory(Long riskId) {
        List<RiskHistory> histories = riskHistoryRepo.findByRiskIdOrderByChangedAtDesc(riskId);
        return histories.stream()
            .map(this::convertHistoryToDTO)
            .collect(Collectors.toList());
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
        
        // Set state names
        dto.setPreviousStateName(StateNameUtils.getRiskStateName(history.getPreviousState()));
        dto.setStateName(StateNameUtils.getRiskStateName(history.getNewState()));
        
        // Set changed by name
        if (history.getChangedBy() != null) {
            dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        }
        
        return dto;
    }

    // Private helper methods

    /**
     * Kiểm tra tính hợp lệ của dữ liệu RiskDTO.
     */
    private void validateRiskDTO(RiskDTO riskDTO) {
        if (riskDTO == null) {
            throw new IllegalArgumentException("Risk data cannot be null");
        }
    }

    /**
     * Xử lý thay đổi trạng thái và ghi lịch sử.
     */
    private void handleStateChange(Long id, Integer previousState, Integer newState, RiskDTO riskDTO) {
        if (!Objects.equals(previousState, newState)) {
            String stateChangeComment = String.format(
                "Trạng thái thay đổi từ %s sang %s%s",
                StateNameUtils.getRiskStateName(previousState),
                StateNameUtils.getRiskStateName(newState),
                riskDTO.getComment() != null ? " - " + riskDTO.getComment() : ""
            );
            
            addRiskHistory(
                id, 
                previousState, 
                newState, 
                riskDTO.getUpdateBy(), 
                stateChangeComment
            );
        }
    }


    /**
     * Kiểm tra người dùng có quyền truy cập đầy đủ rủi ro.
     * True cho admin và người dùng phòng ban gốc.
     */
    private boolean hasFullAccess(User user, Long departmentId) {
        return user.getRole().equals("1") || 
               departmentRepo.findById(departmentId)
                   .map(dept -> dept.getParentId() == null)
                   .orElse(false);
    }

    /**
     * Lấy danh sách ID phòng ban bao gồm phòng ban gốc và tất cả phòng ban con.
     * @return Danh sách ID phòng ban
     */
    private List<Long> getDepartmentAndSubDepartmentIds(Long departmentId) {
        List<Long> departmentIds = new java.util.ArrayList<>();
        departmentIds.add(departmentId);
        departmentIds.addAll(
            departmentService.getAllSubDepartments(departmentId).stream()
                .map(Department::getId)
                .toList()
        );
        return departmentIds;
    }

    /**
     * Chuyển đổi Risk entity thành RiskDTO.
     * Bao gồm tên trạng thái và tên người phản ánh.
     */
    private RiskDTO convertToDTO(Risk risk) {
        RiskDTO dto = new RiskDTO();
        dto.setId(risk.getId());
        dto.setCode(risk.getCode());
        dto.setName(risk.getName());
        dto.setState(risk.getState());
        dto.setRiskTypeId(risk.getRiskTypeId());
        dto.setProjectId(risk.getProjectId());
        dto.setDepartmentId(risk.getDepartmentId());
        dto.setImpactLevelId(risk.getImpactLevelId());
        dto.setScopeId(risk.getScopeId());
        dto.setPossibilityId(risk.getPossibilityId());
        dto.setPriorityId(risk.getPriorityId());
        dto.setReflectorId(risk.getReflectorId());
        dto.setRootCause(risk.getRootCause());
        dto.setImpactAnalysis(risk.getImpactAnalysis());
        dto.setRemedy(risk.getRemedy());
        dto.setPrecautions(risk.getPrecautions());
        dto.setReflectionDay(risk.getReflectionDay());
        dto.setStatus(risk.getStatus());
        dto.setUpdateBy(risk.getUpdateBy());
        
        dto.setStateName(StateNameUtils.getRiskStateName(risk.getState()));
        if (risk.getReflectorId() != null) {
            dto.setReflectorName(userService.getUserDisplayName(risk.getReflectorId()));
        }
        
        return dto;
    }

    private void validateReferences(RiskDTO riskDTO) {
        // Validate project exists
        if (riskDTO.getProjectId() != null) {
            projectRepo.findById(riskDTO.getProjectId())
                .orElseThrow(() -> new RuntimeException("Dự án không tồn tại"));
        }
        // Validate task exists if provided
        if (riskDTO.getTaskId() != null) {
            taskRepo.findById(riskDTO.getTaskId())
                .orElseThrow(() -> new RuntimeException("Công việc không tồn tại"));
        }
    }

    private void validateStateTransition(Integer currentState, Integer newState) {
        if (Objects.equals(currentState, newState)) {
            return;
        }

        boolean isValidTransition;

        if (currentState == null) {
            isValidTransition = false;
        } else if (currentState == AppConstants.STATUS_IN_PROGRESS) {
            isValidTransition = newState == AppConstants.STATUS_COMPLETE ||
                newState == AppConstants.STATUS_CANCELED;
        } else if (currentState == AppConstants.STATUS_COMPLETE ||
            currentState == AppConstants.STATUS_CANCELED) {
            isValidTransition = false;
        } else {
            isValidTransition = false;
        }

        if (!isValidTransition) {
            throw new IllegalStateException(
                String.format("Invalid state transition from %s to %s",
                    StateNameUtils.getRiskStateName(currentState),
                    StateNameUtils.getRiskStateName(newState))
            );
        }
    }

    private Risk convertDTOToEntity(RiskDTO dto, Long id) {
        Risk risk = id != null ? riskRepo.findById(id).orElse(new Risk()) : new Risk();
        risk.setName(dto.getName());
        risk.setCode(dto.getCode());
        risk.setDescription(dto.getDescription());
        risk.setState(dto.getState());
        risk.setRiskTypeId(dto.getRiskTypeId());
        risk.setProjectId(dto.getProjectId());
        risk.setDepartmentId(dto.getDepartmentId());
        risk.setImpactLevelId(dto.getImpactLevelId());
        risk.setScopeId(dto.getScopeId());
        risk.setPossibilityId(dto.getPossibilityId());
        risk.setPriorityId(dto.getPriorityId());
        risk.setReflectorId(dto.getReflectorId());
        risk.setRootCause(dto.getRootCause());
        risk.setImpactAnalysis(dto.getImpactAnalysis());
        risk.setRemedy(dto.getRemedy());
        risk.setPrecautions(dto.getPrecautions());
        risk.setReflectionDay(dto.getReflectionDay());
        risk.setStatus(dto.getStatus());
        risk.setUpdateBy(dto.getUpdateBy());
        return risk;
    }
} 