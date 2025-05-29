package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.RiskDTO;
import com.dev.truongdev.dto.RiskHistoryDTO;
import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.entity.RiskHistory;
import com.dev.truongdev.entity.Department;
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
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RiskServiceImpl extends XDevBaseServiceImpl<Risk, RiskFilter, RiskRepo>
        implements IRiskService {

    RiskRepo riskRepo;
    RiskHistoryRepo riskHistoryRepo;
    IUserService userService;
    DepartmentRepo departmentRepo;
    IDepartmentService<Department, ?> departmentService;

    public RiskServiceImpl(RiskRepo repo, 
                          RiskHistoryRepo historyRepo, 
                          IUserService userService, 
                          DepartmentRepo departmentRepo, 
                          IDepartmentService<Department, ?> departmentService) {
        super(repo);
        this.riskRepo = repo;
        this.riskHistoryRepo = historyRepo;
        this.userService = userService;
        this.departmentRepo = departmentRepo;
        this.departmentService = departmentService;
    }

    @Override
    public RiskDTO getRiskById(Long id) {
        validateId(id);
        Risk risk = riskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found with id: " + id));
        return convertToDTO(risk);
    }

    @Override
    @Transactional
    public RiskDTO updateRisk(Long id, RiskDTO riskDTO) {
        validateRiskDTO(riskDTO);
        validateId(id);

        Risk currentRisk = riskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found with id: " + id));
        Integer previousState = currentRisk.getState();

        validateReferences(riskDTO);
        validateStateTransition(previousState, riskDTO.getState());

        Risk updatedRisk = super.update(riskDTO.getUpdateBy(), convertDTOToEntity(riskDTO, id), id);

        handleStateChange(id, previousState, updatedRisk.getState(), riskDTO);

        return convertToDTO(updatedRisk);
    }

    @Override
    @Transactional
    public RiskDTO createRisk(String uid, RiskDTO riskDTO) {
        validateRiskDTO(riskDTO);
        validateUserId(uid);

        Risk risk = new Risk();
        BeanUtils.copyProperties(riskDTO, risk);
        
        risk.setState(AppConstants.STATUS_PENDING);
        risk.setCreateBy(uid);

        User currentUser = userService.getById(uid, Long.valueOf(uid));
        String[] approverInfo = determineApprover(uid, currentUser, risk.getDepartmentId());
        
        risk.setApproverId(approverInfo[0]);
        Risk savedRisk = riskRepo.save(risk);
        
        addRiskHistory(savedRisk.getId(), null, AppConstants.STATUS_PENDING, 
            uid, "Tạo mới risk và gửi phê duyệt tới " + approverInfo[1]);
        
        return convertToDTO(savedRisk);
    }

    @Override
    @Transactional
    public RiskDTO submitForApproval(String uid, Long id, List<Long> approverIds) {
        validateSubmitForApproval(uid, id, approverIds);
        
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
            
        risk.setApproverId(approverIds.get(0).toString());
        risk.setUpdateBy(uid);
        risk.setModifiedDate(new Date());
        
        Risk savedRisk = riskRepo.save(risk);
        
        addRiskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_PENDING, 
            uid, "Đã chỉ định người phê duyệt: " + risk.getApproverId());
        
        return convertToDTO(savedRisk);
    }

    @Override
    @Transactional
    public RiskDTO approveRisk(String uid, Long id, String approvedBy) {
        validateApproval(uid, id);
        
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
        
        risk.setState(AppConstants.STATUS_APPROVED);
        risk.setUpdateBy(uid);
        risk.setModifiedDate(new Date());
        
        Risk savedRisk = riskRepo.save(risk);
        
        addRiskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_APPROVED, 
            uid, "Phê duyệt risk");

        updateRiskState(uid, id, AppConstants.STATUS_IN_PROGRESS, uid, "Tự động chuyển sang trạng thái đang theo dõi");
        
        return convertToDTO(savedRisk);
    }

    @Override
    @Transactional
    public RiskDTO rejectRisk(String uid, Long id, String reason) {
        validateRejection(uid, id);
        
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
        
        risk.setState(AppConstants.STATUS_REJECTED);
        risk.setUpdateBy(uid);
        risk.setModifiedDate(new Date());
        
        Risk savedRisk = riskRepo.save(risk);
        
        addRiskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_REJECTED, 
            uid, "Từ chối risk: " + reason);
        
        return convertToDTO(savedRisk);
    }

    @Override
    @Transactional
    public void checkAndUpdateRiskStatus(Long riskId) {
        validateId(riskId);
        Risk risk = riskRepo.findById(riskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
                
        if (risk.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        if (isOverdue(risk)) {
            updateRiskState(AppConstants.SYSTEM, riskId, AppConstants.STATUS_OVERDUE, 
                AppConstants.SYSTEM, "Tự động cập nhật trạng thái quá hạn do đã vượt thời hạn phản ánh");
        }
    }

    @Override
    public void changeStatus(String uid, Long id) {
        validateId(id);
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
            
        if (!canDelete(risk.getState())) {
            throw new RuntimeException("Chỉ có thể xóa risk ở trạng thái chờ duyệt hoặc từ chối");
        }

        risk.setStatus(AppConstants.STATUS_INACTIVE);
        risk.setUpdateBy(uid);
        risk.setModifiedDate(new Date());
        riskRepo.save(risk);
        
        addRiskHistory(id, risk.getState(), risk.getState(), uid, "Xóa risk");
    }

    @Override
    public Page<Risk> getPendingApprovalRisks(String approverId, RiskFilter filter, Pageable pageable) {
        validateUserId(approverId);
        return riskRepo.findPendingApprovalRisks(
            AppConstants.STATUS_ACTIVE,
            AppConstants.STATUS_PENDING,
            approverId,
            filter.getSearch(),
            pageable
        );
    }

    @Override
    public Page<Risk> searchAll(Long departmentId, String uid, RiskFilter filter, Pageable pageable) {
        validateDepartmentId(departmentId);
        validateUserId(uid);
        
        User user = userService.getById(uid, Long.valueOf(uid));

        if (hasFullAccess(user, departmentId)) {
            return riskRepo.searchByCodeOrName(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                pageable
            );
        }

        List<Long> departmentIds = getDepartmentAndSubDepartmentIds(departmentId);
        return riskRepo.searchByCodeOrNameAndDepartments(
            AppConstants.STATUS_ACTIVE,
            filter.getSearch(),
            departmentIds,
            pageable
        );
    }

    // Private helper methods
    private void validateRiskDTO(RiskDTO riskDTO) {
        if (riskDTO == null) {
            throw new IllegalArgumentException("Risk data cannot be null");
        }
        if (riskDTO.getState() == null) {
            throw new IllegalArgumentException("Risk state cannot be null");
        }
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid ID");
        }
    }

    private void validateUserId(String uid) {
        if (!StringUtils.hasText(uid)) {
            throw new IllegalArgumentException("User ID cannot be empty");
        }
    }

    private void validateDepartmentId(Long departmentId) {
        if (departmentId == null || departmentId <= 0) {
            throw new IllegalArgumentException("Invalid department ID");
        }
    }

    private void validateSubmitForApproval(String uid, Long id, List<Long> approverIds) {
        if (approverIds == null || approverIds.isEmpty()) {
            throw new RuntimeException("Phải chỉ định người phê duyệt");
        }
        validateUserId(uid);
        validateId(id);
    }

    private void validateApproval(String uid, Long id) {
        validateUserId(uid);
        validateId(id);
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
            
        if (risk.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Risk phải ở trạng thái chờ duyệt");
        }
        
        if (!uid.equals(risk.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền phê duyệt risk này");
        }
    }

    private void validateRejection(String uid, Long id) {
        validateUserId(uid);
        validateId(id);
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
            
        if (risk.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Risk phải ở trạng thái chờ duyệt để có thể từ chối");
        }
        
        if (!uid.equals(risk.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền từ chối risk này");
        }
    }

    private String[] determineApprover(String uid, User currentUser, Long departmentId) {
        String approverId;
        String approverName;
        
        if (currentUser.getRole().equals("ROLE_ADMIN")) {
            approverId = uid;
            approverName = userService.getUserDisplayName(uid);
        } else {
            Department riskDepartment = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));
            
            Department userDepartment = departmentRepo.findById(currentUser.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban của người dùng"));

            if (isSubDepartment(riskDepartment.getId(), userDepartment.getId())) {
                approverId = uid;
                approverName = userService.getUserDisplayName(uid);
            } else if (riskDepartment.getId().equals(userDepartment.getId())) {
                Department parentDepartment = departmentRepo.findById(riskDepartment.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban cha"));
                
                User departmentHead = userRepo.findByDepartmentIdAndPositionIdAndStatus(
                    parentDepartment.getId(),
                    AppConstants.POSITION_HEAD,
                    AppConstants.STATUS_ACTIVE
                ).stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy trưởng phòng ban cha"));
                
                approverId = departmentHead.getId().toString();
                approverName = userService.getUserDisplayName(approverId);
            } else {
                throw new RuntimeException("Không có quyền tạo risk cho phòng ban này");
            }
        }
        
        return new String[]{approverId, approverName};
    }

    private void handleStateChange(Long id, Integer previousState, Integer newState, RiskDTO riskDTO) {
        if (!Objects.equals(previousState, newState)) {
            String stateChangeComment = String.format(
                "State changed from %s to %s%s",
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

    private boolean isOverdue(Risk risk) {
        return risk.getReflectionDay() != null && new Date().after(risk.getReflectionDay());
    }

    private boolean canDelete(Integer state) {
        return state == AppConstants.STATUS_PENDING || state == AppConstants.STATUS_REJECTED;
    }

    private boolean hasFullAccess(User user, Long departmentId) {
        return user.getRole().equals("ROLE_ADMIN") || 
               departmentRepo.findById(departmentId)
                   .map(dept -> dept.getParentId() == null)
                   .orElse(false);
    }

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

    // Existing helper methods remain unchanged
    private boolean isSubDepartment(Long departmentId, Long parentId) {
        List<Department> subDepartments = departmentService.getAllSubDepartments(parentId);
        return subDepartments.stream()
            .anyMatch(dept -> dept.getId().equals(departmentId));
    }

    private Risk convertDTOToEntity(RiskDTO dto, Long id) {
        Risk risk = new Risk();
        risk.setId(id);
        risk.setState(dto.getState());
        risk.setName(dto.getName());
        risk.setDescription(dto.getDescription());
        risk.setRiskTypeId(dto.getRiskTypeId());
        risk.setProjectId(dto.getProjectId());
        risk.setImpactLevelId(dto.getImpactLevelId());
        risk.setScopeId(dto.getScopeId());
        risk.setDepartmentId(dto.getDepartmentId());
        risk.setReflectorId(dto.getReflectorId());
        risk.setReflectionDay(dto.getReflectionDay());
        risk.setUpdateBy(dto.getUpdateBy());
        return risk;
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
        
        dto.setStateName(StateNameUtils.getRiskStateName(risk.getState()));
        if (risk.getReflectorId() != null) {
            dto.setReflectorName(userService.getUserDisplayName(risk.getReflectorId()));
        }
        
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
        
        dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        dto.setPreviousStateName(StateNameUtils.getRiskStateName(history.getPreviousState()));
        dto.setNewStateName(StateNameUtils.getRiskStateName(history.getNewState()));
        
        return dto;
    }
} 