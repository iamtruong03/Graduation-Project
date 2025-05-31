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

    /**
     * Tạo mới một dự án và khởi tạo quy trình phê duyệt.
     * - Đặt trạng thái ban đầu là CHỜ DUYỆT
     * - Xác định người phê duyệt phù hợp theo phòng ban
     * - Ghi lịch sử tạo dự án
     * @param uid ID người tạo dự án
     * @param projectDTO Thông tin dự án
     * @return Dự án vừa tạo dưới dạng ProjectDTO
     */
    @Override
    @Transactional
    public ProjectDTO createProject(String uid, ProjectDTO projectDTO) {
        validateProjectDTO(projectDTO);

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
    public ProjectDTO updateProject(Long id, ProjectDTO projectDTO) {
        validateProjectDTO(projectDTO);

        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Project not found"));

        if (project.getState() != AppConstants.STATUS_IN_PROGRESS) {
            throw new RuntimeException("Chỉ có thể cập nhật dự án khi đang trong trạng thái thực hiện");
        }

        Integer previousState = project.getState();
        if (projectDTO.getState() == AppConstants.STATUS_COMPLETE){
            project.setCompletedDate(new Date());
        }

        BeanUtils.copyProperties(projectDTO, project, "id", "createBy", "createDate","modifiedDate");
        project = projectRepo.save(project);

        if (!Objects.equals(previousState, project.getState())) {
            createProjectHistory(id, previousState, project.getState(),
                projectDTO.getUpdateBy(), "Cập nhật trạng thái dự án");
        }

        return convertToDTO(project);
    }

    /**
     * Phê duyệt dự án, chuyển trạng thái sang ĐÃ DUYỆT và tự động sang ĐANG THỰC HIỆN.
     * @param uid ID người phê duyệt
     * @param id ID dự án
     * @return Dự án sau khi phê duyệt
     */
    @Override
    @Transactional
    public ProjectDTO approveProject(String uid, Long id) {
        validateApproval(uid, id);
        
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
        
        project.setState(AppConstants.STATUS_IN_PROGRESS);
        project.setIsApproved(true);
        project.setUpdateBy(uid);
        
        Project savedProject = projectRepo.save(project);
        
        createProjectHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_IN_PROGRESS,
            uid, "Phê duyệt dự án");

        updateProjectState(uid, id, AppConstants.STATUS_IN_PROGRESS, "Tự động chuyển sang trạng thái đang thực hiện");
        
        return convertToDTO(savedProject);
    }

    /**
     * Từ chối dự án, chuyển trạng thái sang ĐÃ TỪ CHỐI.
     * @param uid ID người từ chối
     * @param id ID dự án
     * @param reason Lý do từ chối
     * @return Dự án sau khi bị từ chối
     */
    @Override
    @Transactional
    public ProjectDTO rejectProject(String uid, Long id, String reason) {
        validateRejection(uid, id);
        
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
        
        project.setState(AppConstants.STATUS_REJECTED);
        project.setIsApproved(false);
        project.setUpdateBy(uid);
        
        Project savedProject = projectRepo.save(project);
        
        createProjectHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_REJECTED, 
            uid, "Từ chối dự án: " + reason);
        
        return convertToDTO(savedProject);
    }

    /**
     * Cập nhật trạng thái dự án, kiểm tra hợp lệ và ghi lịch sử.
     * @param uid ID người thay đổi
     * @param id ID dự án
     * @param newState Trạng thái mới
     * @param comment Ghi chú thay đổi
     * @return Dự án sau khi cập nhật
     */
    @Override
    @Transactional
    public ProjectDTO updateProjectState(String uid, Long id, Integer newState, String comment) {

        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        validateStateTransition(project.getState(), newState);

        Integer previousState = project.getState();
        project.setState(newState);
        project.setUpdateBy(uid);

        Project savedProject = projectRepo.save(project);

        createProjectHistory(id, previousState, newState, uid, comment);

        return convertToDTO(savedProject);
    }

    /**
     * Kiểm tra và cập nhật trạng thái hoàn thành của dự án dựa vào các task.
     * @param projectId ID dự án cần kiểm tra
     */
    @Override
    @Transactional
    public void checkAndUpdateProjectCompletion(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
                
        if (project.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        List<Task> tasks = taskRepo.findByProjectId(projectId);
        
        if (areAllTasksCompleted(tasks)) {
            handleCompletedProject(project);
        } else if (isOverdue(project)) {
            updateProjectState(AppConstants.SYSTEM, project.getId(), AppConstants.STATUS_OVERDUE, "Tự động cập nhật trạng thái quá hạn do đã vượt thời hạn dự án");
        }
    }

    /**
     * Xóa mềm dự án (chuyển trạng thái sang INACTIVE), chỉ cho phép khi dự án ở trạng thái CHỜ DUYỆT hoặc ĐÃ TỪ CHỐI.
     * @param uid ID người thực hiện xóa
     * @param id ID dự án cần xóa
     */
    @Override
    public void changeStatus(String uid, Long id) {
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        if (!canDelete(project.getState())) {
            throw new RuntimeException("Chỉ có thể xóa dự án ở trạng thái chờ duyệt hoặc từ chối");
        }

        project.setStatus(AppConstants.STATUS_INACTIVE);
        project.setUpdateBy(uid);
        projectRepo.save(project);
        
        createProjectHistory(id, project.getState(), project.getState(), uid, "Xóa dự án");
    }

    /**
     * Lấy danh sách dự án đang chờ phê duyệt của một người.
     * @param approverId ID người phê duyệt
     * @param filter Bộ lọc tìm kiếm
     * @param pageable Thông tin phân trang
     * @return Danh sách dự án chờ phê duyệt
     */
    @Override
    public Page<Project> getPendingApprovalProjects(String approverId, ProjectFilter filter, Pageable pageable) {
        return projectRepo.findPendingApprovalProjects(
            AppConstants.STATUS_ACTIVE,
            AppConstants.STATUS_PENDING,
            approverId,
            filter.getSearch(),
            pageable
        );
    }

    @Override
    public List<Project> getAll(Long did, String uid) {
        User user = userRepo.findById(Long.valueOf(uid))
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (hasFullAccess(user, did)) {
            return projectRepo.findByStatus(AppConstants.STATUS_ACTIVE);
        }

        List<Long> departmentIds = getDepartmentAndSubDepartmentIds(did);
        return projectRepo.findByStatusAndDepartmentIdIn(AppConstants.STATUS_ACTIVE, departmentIds);
    }

    /**
     * Tìm kiếm dự án theo phòng ban, kiểm soát truy cập theo quyền.
     * @param did ID phòng ban
     * @param uid ID người dùng
     * @param filter Bộ lọc tìm kiếm
     * @param pageable Thông tin phân trang
     * @return Danh sách dự án phù hợp
     */
    @Override
    public Page<Project> searchAll(Long did, String uid, ProjectFilter filter, Pageable pageable) {
        User user = userRepo.findById(Long.valueOf(uid))
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (hasFullAccess(user, did)) {
            return projectRepo.searchByCodeOrName(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                pageable
            );
        }

        List<Long> departmentIds = getDepartmentAndSubDepartmentIds(did);
        return projectRepo.searchByCodeOrNameAndDepartments(
            AppConstants.STATUS_ACTIVE,
            filter.getSearch(),
            departmentIds,
            pageable
        );
    }

    @Override
    public List<ProjectHistoryDTO> getProjectHistory(Long projectId) {
        List<ProjectHistory> histories = projectHistoryRepo.findByProjectIdOrderByChangedAtDesc(projectId);
        return histories.stream()
            .map(this::convertHistoryToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public void addProjectHistory(Long projectId, Integer previousState, Integer newState, String changedBy, String comment) {
        createProjectHistory(projectId, previousState, newState, changedBy, comment);
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

    private void validateSubmitForApproval(String uid, Long id, List<Long> approverIds) {
        if (approverIds == null || approverIds.isEmpty()) {
            throw new RuntimeException("Phải chỉ định người phê duyệt");
        }
    }

    private void validateApproval(String uid, Long id) {
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
        
        if (currentUser.getRole().equals("1")) {
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

        boolean isValidTransition;

        if (currentState == null) {
            isValidTransition = false;
        } else if (currentState == AppConstants.STATUS_PENDING) {
            isValidTransition = newState == AppConstants.STATUS_IN_PROGRESS ||
                newState == AppConstants.STATUS_REJECTED;
        } else if (currentState == AppConstants.STATUS_IN_PROGRESS) {
            isValidTransition = newState == AppConstants.STATUS_IN_PROGRESS ||
                newState == AppConstants.STATUS_COMPLETE ||
                newState == AppConstants.STATUS_OVERDUE;
        } else if (currentState == AppConstants.STATUS_COMPLETE ||
            currentState == AppConstants.STATUS_OVERDUE ||
            currentState == AppConstants.STATUS_REJECTED ||
            currentState == AppConstants.STATUS_CANCELED) {
            isValidTransition = false;
        } else {
            isValidTransition = false;
        }

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
                .allMatch(task -> task.getState() == State.COMPLETE.ordinal());
    }

    private void handleCompletedProject(Project project) {
        if (isOverdue(project)) {
            updateProjectState(AppConstants.SYSTEM, project.getId(), AppConstants.STATUS_OVERDUE, 
                 "Tự động cập nhật trạng thái quá hạn do đã hoàn thành sau thời hạn");
        } else {
            updateProjectState(AppConstants.SYSTEM, project.getId(), AppConstants.STATUS_COMPLETE,
                 "Tự động cập nhật trạng thái hoàn thành");
        }
    }

    private boolean isOverdue(Project project) {
        return project.getEndDate() != null && new Date().after(project.getEndDate());
    }

    private boolean canDelete(Integer state) {
        return state == AppConstants.STATUS_PENDING || state == AppConstants.STATUS_REJECTED;
    }

    private boolean hasFullAccess(User user, Long departmentId) {
        return user.getRole().equals("1") || 
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
                    .filter(task -> task.getState() == State.COMPLETE.ordinal())
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
