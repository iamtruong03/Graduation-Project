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

import java.util.Date;
import java.util.List;
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
        Risk risk = riskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found with id: " + id));
        return convertToDTO(risk);
    }

    @Override
    @Transactional
    public RiskDTO updateRisk(Long id, RiskDTO riskDTO) {
        // Validate input
        if (riskDTO == null) {
            throw new IllegalArgumentException("Risk data cannot be null");
        }
        if (riskDTO.getState() == null) {
            throw new IllegalArgumentException("Risk state cannot be null");
        }

        // Get current risk for state comparison
        Risk currentRisk = riskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found with id: " + id));
        Integer previousState = currentRisk.getState();

        // Validate references and state transition
        validateReferences(riskDTO);
        validateStateTransition(previousState, riskDTO.getState());

        // Update using base method
        Risk updatedRisk = super.update(riskDTO.getUpdateBy(), convertDTOToEntity(riskDTO, id), id);

        // Handle risk-specific logic: state change history
        if (!previousState.equals(updatedRisk.getState())) {
            String stateChangeComment = String.format(
                "State changed from %s to %s%s",
                StateNameUtils.getRiskStateName(previousState),
                StateNameUtils.getRiskStateName(updatedRisk.getState()),
                riskDTO.getComment() != null ? " - " + riskDTO.getComment() : ""
            );
            
            addRiskHistory(
                id, 
                previousState, 
                updatedRisk.getState(), 
                riskDTO.getUpdateBy(), 
                stateChangeComment
            );
        }

        return convertToDTO(updatedRisk);
    }

    @Override
    @Transactional
    public RiskDTO createRisk(String uid, RiskDTO riskDTO) {
        Risk risk = new Risk();
        BeanUtils.copyProperties(riskDTO, risk);
        
        // Set initial state
        risk.setState(AppConstants.STATUS_PENDING);
        risk.setCreateBy(uid);

        // Get current user
        User currentUser = userService.getById(uid, Long.valueOf(uid));

        String approverId;
        String approverName;
        
        if (currentUser.getRole().equals("ROLE_ADMIN")) {
            // Admin tự phê duyệt
            approverId = uid;
            approverName = userService.getUserDisplayName(uid);
        } else {
            // Get department info
            Department riskDepartment = departmentRepo.findById(risk.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));
            
            Department userDepartment = departmentRepo.findById(currentUser.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban của người dùng"));

            if (isSubDepartment(riskDepartment.getId(), userDepartment.getId())) {
                // Nếu tạo cho phòng ban con/cháu/chắt -> người tạo tự duyệt
                approverId = uid;
                approverName = userService.getUserDisplayName(uid);
            } else if (riskDepartment.getId().equals(userDepartment.getId())) {
                // Nếu tạo cho chính phòng ban của mình -> trưởng phòng ban cha duyệt
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
        
        // Set approver
        risk.setApproverId(approverId);
        
        Risk savedRisk = riskRepo.save(risk);
        
        // Log history
        addRiskHistory(savedRisk.getId(), null, AppConstants.STATUS_PENDING, 
            uid, "Tạo mới risk và gửi phê duyệt tới " + approverName);
        
        return convertToDTO(savedRisk);
    }

    @Override
    @Transactional
    public RiskDTO submitForApproval(String uid, Long id, List<Long> approverIds) {
        if (approverIds == null || approverIds.isEmpty()) {
            throw new RuntimeException("Phải chỉ định người phê duyệt");
        }
        
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
            
        if (risk.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Risk phải ở trạng thái chờ duyệt");
        }
        
        // Chỉ lấy người phê duyệt đầu tiên
        risk.setApproverId(approverIds.get(0).toString());
        risk.setUpdateBy(uid);
        risk.setModifiedDate(new Date());
        
        Risk savedRisk = riskRepo.save(risk);
        
        // Log history
        addRiskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_PENDING, 
            uid, "Đã chỉ định người phê duyệt: " + risk.getApproverId());
        
        return convertToDTO(savedRisk);
    }

    @Override
    @Transactional
    public RiskDTO approveRisk(String uid, Long id, String approvedBy) {
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
            
        if (risk.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Risk phải ở trạng thái chờ duyệt");
        }
        
        // Kiểm tra quyền phê duyệt
        if (!uid.equals(risk.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền phê duyệt risk này");
        }
        
        // Cập nhật trạng thái
        risk.setState(AppConstants.STATUS_APPROVED);
        risk.setUpdateBy(uid);
        risk.setModifiedDate(new Date());
        
        Risk savedRisk = riskRepo.save(risk);
        
        // Log history
        addRiskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_APPROVED, 
            uid, "Phê duyệt risk");

        // Tự động chuyển sang trạng thái IN_PROGRESS
        updateRiskState(uid, id, AppConstants.STATUS_IN_PROGRESS, uid, "Tự động chuyển sang trạng thái đang theo dõi");
        
        return convertToDTO(savedRisk);
    }

    @Override
    @Transactional
    public RiskDTO rejectRisk(String uid, Long id, String reason) {
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
            
        if (risk.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Risk phải ở trạng thái chờ duyệt để có thể từ chối");
        }
        
        // Kiểm tra quyền từ chối
        if (!uid.equals(risk.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền từ chối risk này");
        }
        
        risk.setState(AppConstants.STATUS_REJECTED);
        risk.setUpdateBy(uid);
        risk.setModifiedDate(new Date());
        
        Risk savedRisk = riskRepo.save(risk);
        
        // Log history
        addRiskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_REJECTED, 
            uid, "Từ chối risk: " + reason);
        
        return convertToDTO(savedRisk);
    }

    @Override
    @Transactional
    public void checkAndUpdateRiskStatus(Long riskId) {
        Risk risk = riskRepo.findById(riskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
                
        // Chỉ kiểm tra khi risk đang trong trạng thái IN_PROGRESS
        if (risk.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        // Kiểm tra ngày phản ánh
        Date now = new Date();
        if (risk.getReflectionDay() != null && now.after(risk.getReflectionDay())) {
            updateRiskState(AppConstants.SYSTEM, riskId, AppConstants.STATUS_OVERDUE, 
                AppConstants.SYSTEM, "Tự động cập nhật trạng thái quá hạn do đã vượt thời hạn phản ánh");
        }
    }

    @Override
    public Page<Risk> getPendingApprovalRisks(String approverId, RiskFilter filter, Pageable pageable) {
        return riskRepo.findPendingApprovalRisks(
            AppConstants.STATUS_ACTIVE,
            AppConstants.STATUS_PENDING,
            approverId,
            filter.getSearch(),
            pageable
        );
    }

    private void updateRiskState(String uid, Long id, Integer newState, String changedBy, String comment) {
        Risk risk = riskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
                
        Integer previousState = risk.getState();
        risk.setState(newState);
        risk.setUpdateBy(changedBy);
        risk.setModifiedDate(new Date());
        
        riskRepo.save(risk);
        
        // Log history
        addRiskHistory(id, previousState, newState, changedBy, comment);
    }

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

    private void validateReferences(RiskDTO riskDTO) {
        // Validate reflector exists
        if (riskDTO.getReflectorId() != null) {
            userService.getById("system", riskDTO.getReflectorId());
        }

        // Validate department exists if provided
        if (riskDTO.getDepartmentId() != null) {
            departmentRepo.findById(riskDTO.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + riskDTO.getDepartmentId()));
        }

        // Add other reference validations as needed
        // Example: risk type, impact level, scope, etc.
    }

    private void validateStateTransition(Integer currentState, Integer newState) {
        if (currentState.equals(newState)) {
            return; // Same state, no validation needed
        }

        boolean isValidTransition = switch (currentState) {
            case 1 -> newState == 2; // New -> In Progress
            case 2 -> newState == 3 || newState == 1; // In Progress -> Review or New
            case 3 -> newState == 4 || newState == 2; // Review -> Completed or In Progress
            case 4 -> false; // Completed -> No further transitions
            default -> false;
        };

        if (!isValidTransition) {
            throw new IllegalStateException(
                String.format("Invalid state transition from %s to %s",
                    StateNameUtils.getRiskStateName(currentState),
                    StateNameUtils.getRiskStateName(newState))
            );
        }
    }

    @Override
    public List<RiskHistoryDTO> getRiskHistory(Long riskId) {
        // Verify risk exists
        if (!riskRepo.existsById(riskId)) {
            throw new RuntimeException("Risk not found with id: " + riskId);
        }
        
        return riskHistoryRepo.findByRiskIdOrderByChangedAtDesc(riskId)
                .stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addRiskHistory(Long riskId, Integer previousState, Integer newState, String changedBy, String comment) {
        // Verify risk exists
        if (!riskRepo.existsById(riskId)) {
            throw new RuntimeException("Risk not found with id: " + riskId);
        }
        
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
    public Page<Risk> searchAll(Long departmentId, String uid, RiskFilter filter, Pageable pageable) {
        User user = userService.getById(uid, Long.valueOf(uid));

        // Check if user is admin or from root department
        boolean hasFullAccess = user.getRole().equals("ROLE_ADMIN") || 
                              departmentRepo.findById(departmentId)
                                  .map(dept -> dept.getParentId() == null)
                                  .orElse(false);

        if (hasFullAccess) {
            return riskRepo.searchByCodeOrName(
                1, // STATUS_ACTIVE
                filter.getSearch(),
                pageable
            );
        }

        // Get department and its sub-departments
        Department department = departmentRepo.findById(departmentId)
            .orElseThrow(() -> new RuntimeException("Department not found with id: " + departmentId));

        List<Long> departmentIds = new java.util.ArrayList<>();
        departmentIds.add(departmentId);
        departmentIds.addAll(
            departmentService.getAllSubDepartments(departmentId).stream()
                .map(Department::getId)
                .toList()
        );

        return riskRepo.searchByCodeOrNameAndDepartments(
            1, // STATUS_ACTIVE
            filter.getSearch(),
            departmentIds,
            pageable
        );
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
        
        // Set display names
        dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        dto.setPreviousStateName(StateNameUtils.getRiskStateName(history.getPreviousState()));
        dto.setNewStateName(StateNameUtils.getRiskStateName(history.getNewState()));
        
        return dto;
    }

    @Override
    public void changeStatus(String uid, Long id) {
        Risk risk = riskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy risk"));
            
        // Chỉ cho phép xóa mềm ở trạng thái chờ duyệt hoặc từ chối
        if (risk.getState() != AppConstants.STATUS_PENDING && 
            risk.getState() != AppConstants.STATUS_REJECTED) {
            throw new RuntimeException("Chỉ có thể xóa risk ở trạng thái chờ duyệt hoặc từ chối");
        }

        risk.setStatus(AppConstants.STATUS_INACTIVE);
        risk.setUpdateBy(uid);
        risk.setModifiedDate(new Date());
        riskRepo.save(risk);
        
        // Log history
        addRiskHistory(id, risk.getState(), risk.getState(), uid, "Xóa risk");
    }
} 