package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.ProjectDTO;
import com.dev.truongdev.dto.ProjectHistoryDTO;
import com.dev.truongdev.dto.dashboard.project.ProjectStatsDTO;
import com.dev.truongdev.dto.dashboard.project.UserProjectStatsDTO;
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
import com.dev.truongdev.service.IDepartmentService;
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
    final IDepartmentService departmentService;

    public ProjectServiceImpl(ProjectRepo repo, ProjectHistoryRepo projectHistoryRepo,
            TaskRepo taskRepo, UserRepo userRepo, DepartmentRepo departmentRepo,
            IUserService userService, IDepartmentService departmentService) {
        super(repo);
        this.projectRepo = repo;
        this.projectHistoryRepo = projectHistoryRepo;
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
        this.departmentRepo = departmentRepo;
        this.userService = userService;
        this.departmentService = departmentService;
    }

    /**
     * Tạo mới một dự án và khởi tạo quy trình phê duyệt.
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
    @Transactional
    public ProjectDTO updateProject(String uid, Long id, ProjectDTO projectDTO) {
        validateProjectDTO(projectDTO);

        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Kiểm tra quyền cập nhật
        if (!uid.equals(project.getApproverId()) && !uid.equals(project.getManagerId())) {
            throw new RuntimeException("Không có quyền cập nhật");
        }

        if (project.getState() != AppConstants.STATUS_IN_PROGRESS) {
            throw new RuntimeException(
                    "Chỉ có thể cập nhật dự án khi đang trong trạng thái thực hiện");
        }

        Integer previousState = project.getState();
        if (projectDTO.getState() == AppConstants.STATUS_COMPLETE) {
            // Kiểm tra trạng thái của các task
            List<Task> tasks = taskRepo.findByProjectIdAndStatus(id, 1);
            if (tasks.isEmpty()) {
                throw new RuntimeException("Không thể hoàn thành dự án khi chưa có công việc nào");
            }

            // Kiểm tra xem tất cả task đã hoàn thành chưa
            boolean allTasksCompleted = tasks.stream()
                    .allMatch(task -> task.getState() == AppConstants.STATUS_COMPLETE);

            if (!allTasksCompleted) {
                throw new RuntimeException(
                        "Không thể hoàn thành dự án khi còn công việc chưa hoàn thành");
            }

            project.setCompletedDate(new Date());
        }

        BeanUtils.copyProperties(projectDTO, project, "id", "createBy", "createDate",
                "modifiedDate");
        project = projectRepo.save(project);

        if (!Objects.equals(previousState, project.getState())) {
            createProjectHistory(id, previousState, project.getState(),
                    projectDTO.getUpdateBy(), "Cập nhật trạng thái dự án");
        }

        checkAndUpdateProjectCompletion(id);

        return convertToDTO(project);
    }

    @Override
    public Project getById(String uid, Long id) {
        Project project = super.getById(uid, id);

        checkAndUpdateProjectCompletion(id);

        return project;
    }

    /**
     * Kiểm tra và cập nhật trạng thái dự án dựa trên: - Nếu không có task: Kiểm tra
     * quá hạn - Nếu có
     * task: Kiểm tra trạng thái task và thời hạn Tự động chuyển sang trạng thái
     * hoàn thành/quá hạn
     * tương ứng
     */
    @Override
    @Transactional
    public void checkAndUpdateProjectCompletion(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        if (project.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        List<Task> tasks = taskRepo.findByProjectIdAndStatus(projectId, 1);
        Date currentDate = new Date();
        boolean isOverdue = project.getEndDate() != null && currentDate.after(project.getEndDate());

        if (tasks.isEmpty()) {
            if (isOverdue) {
                // Nếu không có task và đã quá hạn
                project.setState(AppConstants.STATUS_OVERDUE);
                project.setUpdateBy(AppConstants.SYSTEM);
                projectRepo.save(project);

                addProjectHistory(
                        projectId,
                        AppConstants.STATUS_IN_PROGRESS,
                        AppConstants.STATUS_OVERDUE,
                        AppConstants.SYSTEM,
                        "Tự động cập nhật trạng thái quá hạn do không có công việc nào và đã quá thời hạn");
            }
            return;
        }

        boolean allTasksCompleted = tasks.stream()
                .allMatch(task -> task.getState() == AppConstants.STATUS_COMPLETE);

        if (allTasksCompleted) {
            if (isOverdue) {
                // Nếu quá hạn và tất cả task đã hoàn thành
                project.setState(AppConstants.STATUS_OVERDUE);
                project.setCompletedDate(currentDate);
                project.setUpdateBy(AppConstants.SYSTEM);
                projectRepo.save(project);

                addProjectHistory(
                        projectId,
                        AppConstants.STATUS_IN_PROGRESS,
                        AppConstants.STATUS_OVERDUE,
                        AppConstants.SYSTEM,
                        "Tự động cập nhật trạng thái quá hạn do hoàn thành sau thời hạn");
            } else {
                // Nếu hoàn thành đúng hạn
                project.setState(AppConstants.STATUS_COMPLETE);
                project.setCompletedDate(currentDate);
                project.setUpdateBy(AppConstants.SYSTEM);
                projectRepo.save(project);

                addProjectHistory(
                        projectId,
                        AppConstants.STATUS_IN_PROGRESS,
                        AppConstants.STATUS_COMPLETE,
                        AppConstants.SYSTEM,
                        "Tự động cập nhật trạng thái hoàn thành do tất cả công việc đã hoàn thành");
            }
        } else if (isOverdue) {
            // Nếu quá hạn và có task chưa hoàn thành
            project.setState(AppConstants.STATUS_OVERDUE);
            project.setUpdateBy(AppConstants.SYSTEM);
            projectRepo.save(project);

            addProjectHistory(
                    projectId,
                    AppConstants.STATUS_IN_PROGRESS,
                    AppConstants.STATUS_OVERDUE,
                    AppConstants.SYSTEM,
                    "Tự động cập nhật trạng thái quá hạn do có công việc chưa hoàn thành sau thời hạn");
        }
    }

    /**
     * Phê duyệt dự án, chuyển trạng thái sang ĐÃ DUYỆT và tự động sang ĐANG THỰC
     * HIỆN.
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

        updateProjectState(uid, id, AppConstants.STATUS_IN_PROGRESS,
                "Tự động chuyển sang trạng thái đang thực hiện");

        return convertToDTO(savedProject);
    }

    /**
     * Từ chối dự án, chuyển trạng thái sang ĐÃ TỪ CHỐI.
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
     * Xóa mềm dự án (chuyển trạng thái sang INACTIVE), chỉ cho phép khi dự án ở
     * trạng thái CHỜ DUYỆT
     * hoặc ĐÃ TỪ CHỐI.
     */
    @Override
    public void changeStatus(String uid, Long id) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        // Kiểm tra quyền cập nhật
        if (!uid.equals(project.getApproverId())) {
            throw new RuntimeException("Không có quyền xóa");
        }

        if (!canDelete(project.getState())) {
            throw new RuntimeException("Chỉ có thể xóa dự án ở trạng thái chờ duyệt hoặc từ chối");
        }

        project.setStatus(AppConstants.STATUS_INACTIVE);
        project.setUpdateBy(uid);
        projectRepo.save(project);

        createProjectHistory(id, project.getState(), project.getState(), uid, "Xóa dự án");
    }

    @Override
    public Page<Project> getPendingApprovalProjects(String approverId, ProjectFilter filter,
            Pageable pageable) {
        return projectRepo.findPendingApprovalProjects(
                AppConstants.STATUS_ACTIVE,
                AppConstants.STATUS_PENDING,
                approverId,
                filter.getSearch(),
                pageable);
    }

    @Override
    public List<Project> getAll(Long did, String uid) {
        User user = userRepo.findById(Long.valueOf(uid))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        List<Project> projects;
        if (hasFullAccess(user, did)) {
            projects = projectRepo.findByStatus(AppConstants.STATUS_ACTIVE);
        } else {
            List<Long> departmentIds = getDepartmentAndSubDepartmentIds(did);
            projects = projectRepo.findByStatusAndDepartmentIdIn(AppConstants.STATUS_ACTIVE,
                    departmentIds);
        }

        for (Project project : projects) {
            checkAndUpdateProjectCompletion(project.getId());
        }

        return projects;
    }

    @Override
    public Page<Project> searchAll(Long did, String uid, ProjectFilter filter, Pageable pageable) {
        User user = userRepo.findById(Long.valueOf(uid))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Page<Project> projectPage;
        if (hasFullAccess(user, did)) {
            projectPage = projectRepo.searchByCodeOrName(
                    AppConstants.STATUS_ACTIVE,
                    filter.getSearch(),
                    filter.getProjectTypeId(),
                    filter.getManagerId(),
                    pageable);
        } else {
            List<Long> departmentIds = getDepartmentAndSubDepartmentIds(did);
            projectPage = projectRepo.searchByCodeOrNameAndDepartments(
                    AppConstants.STATUS_ACTIVE,
                    filter.getSearch(),
                    departmentIds,
                    filter.getProjectTypeId(),
                    filter.getManagerId(),
                    pageable);
        }

        for (Project project : projectPage.getContent()) {
            checkAndUpdateProjectCompletion(project.getId());
        }

        return projectPage;
    }

    @Override
    public List<ProjectHistoryDTO> getProjectHistory(Long projectId) {
        List<ProjectHistory> histories = projectHistoryRepo.findByProjectIdOrderByChangedAtDesc(
                projectId);
        return histories.stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void addProjectHistory(Long projectId, Integer previousState, Integer newState,
            String changedBy, String comment) {
        createProjectHistory(projectId, previousState, newState, changedBy, comment);
    }

    @Override
    public String getProjectNameById(Long id) {
        if (id == null) {
            return "";
        }
        return projectRepo.findById(id)
                .map(Project::getName)
                .orElse("");
    }

    // Private helper methods
    private void validateProjectDTO(ProjectDTO projectDTO) {
        if (projectDTO == null) {
            throw new IllegalArgumentException("Project data cannot be null");
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
                if (userDepartment.getParentId() == null) {
                    // Nếu user thuộc phòng ban root, tìm trưởng phòng của chính phòng ban đó
                    User departmentHead = userRepo.findByDepartmentIdAndPositionIdAndStatus(
                            userDepartment.getId(),
                            AppConstants.POSITION_HEAD,
                            AppConstants.STATUS_ACTIVE).stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy trưởng phòng ban"));

                    approverId = departmentHead.getId().toString();
                    approverName = userService.getUserDisplayName(approverId);
                } else {
                    // Nếu không phải phòng ban root, tìm trưởng phòng ban cha
                    Department parentDepartment = departmentRepo.findById(
                            projectDepartment.getParentId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban cha"));

                    User departmentHead = userRepo.findByDepartmentIdAndPositionIdAndStatus(
                            parentDepartment.getId(),
                            AppConstants.POSITION_HEAD,
                            AppConstants.STATUS_ACTIVE).stream().findFirst()
                            .orElseThrow(
                                    () -> new RuntimeException("Không tìm thấy trưởng phòng ban cha"));

                    approverId = departmentHead.getId().toString();
                    approverName = userService.getUserDisplayName(approverId);
                }
            } else {
                throw new RuntimeException("Không có quyền tạo dự án cho phòng ban này");
            }
        }

        return new String[] { approverId, approverName };
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
                            StateNameUtils.getProjectStateName(newState)));
        }
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
                        .collect(Collectors.toList()));
        return departmentIds;
    }

    private List<Department> getAllSubDepartments(Long departmentId) {
        List<Department> subDepartments = departmentRepo.findByParentIdAndStatus(
                departmentId,
                AppConstants.STATUS_ACTIVE);

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

        List<Task> tasks = taskRepo.findByProjectIdAndStatus(project.getId(), 1);
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

        if (history.getChangedBy() != null) {
            if (history.getChangedBy().equals(AppConstants.SYSTEM)) {
                dto.setChangedByName("Hệ thống");
            } else {
                dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
            }
        }

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

    @Override
    public ProjectStatsDTO getProjectStats(String uid, Long did, Long projectId) {

        Project project = projectRepo.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        ProjectStatsDTO result = new ProjectStatsDTO();

        result.setProjectTaskProcess(taskRepo.countByProjectIdAndStatusAndState(
            projectId, 1, AppConstants.STATUS_IN_PROGRESS));

        result.setProjectTaskComplete(taskRepo.countByProjectIdAndStatusAndState(
            projectId, 1, AppConstants.STATUS_COMPLETE));

        result.setTotalProjectTask(taskRepo.countByProjectIdAndStatus(projectId, 1));

        Long complete = result.getProjectTaskComplete();
        Long total = result.getTotalProjectTask();

        double projectRate = (total != 0) ? (complete * 100.0 / total) : 0.0;
        result.setProjectRate(projectRate);

        // user
        List<User> users = userRepo.findByDepartmentIdAndStatus(project.getDepartmentId(), 1);
        List<UserProjectStatsDTO> userProjectStatsDTOS = new ArrayList<>();

        for (User u : users) {
            Long userId = u.getId();

            String nameUser = userService.getUserDisplayName(String.valueOf(userId));
            String departmentName = departmentService.getDepartmentNameById(u.getDepartmentId());
            String projectName = project.getName();

            Long taskProcess =  taskRepo.countByAssigneeIdAndProjectIdAndStatusAndState(
                String.valueOf(userId), projectId, 1, AppConstants.STATUS_IN_PROGRESS);

            Long taskComplete= taskRepo.countByAssigneeIdAndProjectIdAndStatusAndState(
                String.valueOf(userId), projectId, 1, AppConstants.STATUS_COMPLETE);

            Long totalTask= taskRepo.countByAssigneeIdAndProjectIdAndStatus(String.valueOf(userId), projectId ,1);

            Double completionRate= (totalTask != 0) ? (taskComplete * 100.0 / totalTask) : 0.0;

            Long projectTotalComplete = result.getProjectTaskComplete();
            Double projectCompletionRate = (projectTotalComplete != 0)
                ? (taskComplete * 100.0 / projectTotalComplete)
                : 0.0;

            userProjectStatsDTOS.add(new UserProjectStatsDTO(
                nameUser, departmentName, projectName, taskProcess, taskComplete, totalTask ,completionRate, projectCompletionRate));

        }
        result.setUserProjectStatsDTOS(userProjectStatsDTOS);

        return result;
    }

}
