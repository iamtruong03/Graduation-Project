package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.ProjectDTO;
import com.dev.truongdev.dto.ProjectHistoryDTO;
import com.dev.truongdev.entity.Project;
import com.dev.truongdev.entity.ProjectHistory;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.repo.ProjectHistoryRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.repo.TaskRepo;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.service.IProjectService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.AppConstants.State;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.utils.StateNameUtils;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class ProjectServiceImpl extends XDevBaseServiceImpl<Project, ProjectFilter, ProjectRepo> 
        implements IProjectService {

    final ProjectRepo projectRepo;
    final ProjectHistoryRepo projectHistoryRepo;
    final TaskRepo taskRepo;
    final UserRepo userRepo;
    final DepartmentRepo departmentRepo;
    final IUserService userService;

    public ProjectServiceImpl(ProjectRepo repo, ProjectHistoryRepo projectHistoryRepo, 
            TaskRepo taskRepo, UserRepo userRepo, DepartmentRepo departmentRepo, IUserService userService) {
        super(repo);
        this.projectRepo = repo;
        this.projectHistoryRepo = projectHistoryRepo;
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
        this.departmentRepo = departmentRepo;
        this.userService = userService;
    }

    @Override
    public ProjectDTO getProjectById(Long id) {
        validateId(id);
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return convertToDTO(project);
    }

    @Override
    @Transactional
    public ProjectDTO createProject(String uid, ProjectDTO projectDTO) {
        validateProjectDTO(projectDTO);
        validateUserId(uid);

        Project project = new Project();
        BeanUtils.copyProperties(projectDTO, project);
        
        project.setState(AppConstants.STATUS_PENDING);
        project.setIsApproved(false);
        project.setCreateBy(uid);

        User currentUser = userRepo.findById(Long.valueOf(uid))
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        String[] approverInfo = determineApprover(uid, currentUser, project.getDepartmentId());
        
        project.setApproverId(approverInfo[0]);
        Project savedProject = projectRepo.save(project);
        
        createProjectHistory(savedProject.getId(), null, AppConstants.STATUS_PENDING, 
            uid, "Tạo mới dự án và gửi phê duyệt tới " + approverInfo[1]);
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public ProjectDTO submitForApproval(String uid, Long id, List<Long> approverIds) {
        validateSubmitForApproval(uid, id, approverIds);
        
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        project.setApproverId(approverIds.get(0).toString());
        project.setUpdateBy(uid);
        project.setModifiedDate(new Date());
        
        Project savedProject = projectRepo.save(project);
        
        createProjectHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_PENDING, 
            uid, "Đã chỉ định người phê duyệt: " + project.getApproverId());
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public ProjectDTO approveProject(String uid, Long id, String approvedBy) {
        validateApproval(uid, id);
        
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
        
        project.setState(AppConstants.STATUS_APPROVED);
        project.setIsApproved(true);
        project.setUpdateBy(uid);
        project.setModifiedDate(new Date());
        
        Project savedProject = projectRepo.save(project);
        
        createProjectHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_APPROVED, 
            uid, "Phê duyệt dự án");

        updateProjectState(uid, id, AppConstants.STATUS_IN_PROGRESS, uid, "Tự động chuyển sang trạng thái đang thực hiện");
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public ProjectDTO rejectProject(String uid, Long id, String reason) {
        validateRejection(uid, id);
        
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
        
        project.setState(AppConstants.STATUS_REJECTED);
        project.setIsApproved(false);
        project.setUpdateBy(uid);
        project.setModifiedDate(new Date());
        
        Project savedProject = projectRepo.save(project);
        
        createProjectHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_REJECTED, 
            uid, "Từ chối dự án: " + reason);
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public ProjectDTO updateProjectState(String uid, Long id, Integer newState, String changedBy, String comment) {
        validateId(id);
        validateUserId(uid);
        
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        validateStateTransition(project.getState(), newState);
            
        Integer previousState = project.getState();
        project.setState(newState);
        project.setUpdateBy(changedBy);
        project.setModifiedDate(new Date());
        
        Project savedProject = projectRepo.save(project);
        
        createProjectHistory(id, previousState, newState, changedBy, comment);
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public void checkAndUpdateProjectCompletion(Long projectId) {
        validateId(projectId);
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
                
        if (project.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        List<Task> tasks = taskRepo.findByProjectId(projectId);
        
        if (areAllTasksCompleted(tasks)) {
            handleCompletedProject(project);
        } else if (isOverdue(project)) {
            updateProjectState(AppConstants.SYSTEM, projectId, AppConstants.STATUS_OVERDUE,
                AppConstants.SYSTEM, "Tự động cập nhật trạng thái quá hạn do đã vượt thời hạn dự án");
        }
    }

    @Override
    public void changeStatus(String uid, Long id) {
        validateId(id);
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        if (!canDelete(project.getState())) {
            throw new RuntimeException("Chỉ có thể xóa dự án ở trạng thái chờ duyệt hoặc từ chối");
        }

        project.setStatus(AppConstants.STATUS_INACTIVE);
        project.setUpdateBy(uid);
        project.setModifiedDate(new Date());
        projectRepo.save(project);
        
        createProjectHistory(id, project.getState(), project.getState(), uid, "Xóa dự án");
    }

    @Override
    public Page<Project> getPendingApprovalProjects(String approverId, ProjectFilter filter, Pageable pageable) {
        validateUserId(approverId);
        return projectRepo.findPendingApprovalProjects(
            AppConstants.STATUS_ACTIVE,
            AppConstants.STATUS_PENDING,
            approverId,
            filter.getSearch(),
            pageable
        );
    }

    @Override
    public Page<Project> searchAll(Long departmentId, String uid, ProjectFilter filter, Pageable pageable) {
        validateDepartmentId(departmentId);
        validateUserId(uid);
        
        User user = userRepo.findById(Long.valueOf(uid))
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (hasFullAccess(user, departmentId)) {
            return projectRepo.searchByCodeOrName(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                pageable
            );
        }

        List<Long> departmentIds = getDepartmentAndSubDepartmentIds(departmentId);
        return projectRepo.searchByCodeOrNameAndDepartments(
            AppConstants.STATUS_ACTIVE,
            filter.getSearch(),
            departmentIds,
            pageable
        );
    }

    // Private helper methods
    private void validateProjectDTO(ProjectDTO projectDTO) {
        if (projectDTO == null) {
            throw new IllegalArgumentException("Project data cannot be null");
        }
        if (projectDTO.getState() == null) {
            throw new IllegalArgumentException("Project state cannot be null");
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
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        if (project.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Dự án phải ở trạng thái chờ duyệt");
        }
        
        if (!uid.equals(project.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền phê duyệt dự án này");
        }
    }

    private void validateRejection(String uid, Long id) {
        validateUserId(uid);
        validateId(id);
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        if (project.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Dự án phải ở trạng thái chờ duyệt để có thể từ chối");
        }
        
        if (!uid.equals(project.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền từ chối dự án này");
        }
    }

    private String[] determineApprover(String uid, User currentUser, Long departmentId) {
        String approverId;
        String approverName;
        
        if (currentUser.getRole().equals("ROLE_ADMIN")) {
            approverId = uid;
            approverName = userService.getUserDisplayName(uid);
        } else {
            Department projectDepartment = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));
            
            Department userDepartment = departmentRepo.findById(currentUser.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban của người dùng"));

            if (isSubDepartment(projectDepartment.getId(), userDepartment.getId())) {
                approverId = uid;
                approverName = userService.getUserDisplayName(uid);
            } else if (projectDepartment.getId().equals(userDepartment.getId())) {
                Department parentDepartment = departmentRepo.findById(projectDepartment.getParentId())
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
                throw new RuntimeException("Không có quyền tạo dự án cho phòng ban này");
            }
        }
        
        return new String[]{approverId, approverName};
    }

    private void validateStateTransition(Integer currentState, Integer newState) {
        if (Objects.equals(currentState, newState)) {
            return;
        }
        
        boolean isValidTransition = switch (currentState) {
            case AppConstants.STATUS_PENDING -> newState == AppConstants.STATUS_APPROVED || newState == AppConstants.STATUS_REJECTED;
            case AppConstants.STATUS_APPROVED -> newState == AppConstants.STATUS_IN_PROGRESS;
            case AppConstants.STATUS_IN_PROGRESS -> newState == AppConstants.STATUS_COMPLETE || newState == AppConstants.STATUS_OVERDUE;
            case AppConstants.STATUS_COMPLETE, AppConstants.STATUS_OVERDUE, AppConstants.STATUS_REJECTED -> false;
            default -> false;
        };

        if (!isValidTransition) {
            throw new IllegalStateException(
                String.format("Invalid state transition from %s to %s",
                    StateNameUtils.getProjectStateName(currentState),
                    StateNameUtils.getProjectStateName(newState))
            );
        }
    }

    private boolean areAllTasksCompleted(List<Task> tasks) {
        return !tasks.isEmpty() && tasks.stream()
                .allMatch(task -> task.getState() == State.COMPLETED.ordinal());
    }

    private void handleCompletedProject(Project project) {
        if (isOverdue(project)) {
            updateProjectState(AppConstants.SYSTEM, project.getId(), AppConstants.STATUS_OVERDUE, 
                AppConstants.SYSTEM, "Tự động cập nhật trạng thái quá hạn do đã hoàn thành sau thời hạn");
        } else {
            updateProjectState(AppConstants.SYSTEM, project.getId(), AppConstants.STATUS_COMPLETE,
                AppConstants.SYSTEM, "Tự động cập nhật trạng thái hoàn thành");
        }
    }

    private boolean isOverdue(Project project) {
        return project.getEndDate() != null && new Date().after(project.getEndDate());
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
        List<Long> departmentIds = new ArrayList<>();
        departmentIds.add(departmentId);
        departmentIds.addAll(
            getAllSubDepartments(departmentId).stream()
                .map(Department::getId)
                .collect(Collectors.toList())
        );
        return departmentIds;
    }

    private List<Department> getAllSubDepartments(Long departmentId) {
        List<Department> subDepartments = departmentRepo.findByParentIdAndStatus(
            departmentId, 
            AppConstants.STATUS_ACTIVE
        );
        
        List<Department> allSubDepartments = new ArrayList<>(subDepartments);
        
        for (Department dept : subDepartments) {
            allSubDepartments.addAll(getAllSubDepartments(dept.getId()));
        }
        
        return allSubDepartments;
    }

    private boolean isSubDepartment(Long departmentId, Long parentId) {
        List<Department> subDepartments = getAllSubDepartments(parentId);
        return subDepartments.stream()
            .anyMatch(dept -> dept.getId().equals(departmentId));
    }

    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        BeanUtils.copyProperties(project, dto);
        
        List<Task> tasks = taskRepo.findByProjectId(project.getId());
        if (!tasks.isEmpty()) {
            int totalTasks = tasks.size();
            int completedTasks = (int) tasks.stream()
                    .filter(task -> task.getState() == State.COMPLETED.ordinal())
                    .count();
            
            dto.setTotalTasks(totalTasks);
            dto.setCompletedTasks(completedTasks);
            dto.setProgressPercentage((double) completedTasks / totalTasks * 100);
        }
        
        return dto;
    }

    private ProjectHistoryDTO convertHistoryToDTO(ProjectHistory history) {
        ProjectHistoryDTO dto = new ProjectHistoryDTO();
        dto.setId(history.getId());
        dto.setProjectId(history.getProjectId());
        dto.setPreviousState(history.getPreviousState());
        dto.setNewState(history.getNewState());
        dto.setChangedBy(history.getChangedBy());
        dto.setChangedAt(history.getChangedAt());
        dto.setComment(history.getComment());
        
        dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        dto.setStateName(StateNameUtils.getProjectStateName(history.getNewState()));
        
        return dto;
    }

    private void createProjectHistory(Long projectId, Integer previousState, 
            Integer newState, String changedBy, String comment) {
        ProjectHistory history = ProjectHistory.builder()
                .projectId(projectId)
                .previousState(previousState)
                .newState(newState)
                .changedBy(changedBy)
                .changedAt(new Date())
                .comment(comment)
                .build();
        projectHistoryRepo.save(history);
    }
}
