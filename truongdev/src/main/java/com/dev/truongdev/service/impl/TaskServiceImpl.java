package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.TaskDTO;
import com.dev.truongdev.dto.TaskHistoryDTO;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.Project;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.entity.TaskHistory;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.repo.TaskHistoryRepo;
import com.dev.truongdev.repo.TaskRepo;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.service.ITaskService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.StateNameUtils;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.payload.filter.TaskFilter;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.BeanUtils;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service implementation quản lý công việc (Task).
 * Xử lý CRUD operations, chuyển đổi trạng thái và quy trình phê duyệt công việc.
 */
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskServiceImpl extends XDevBaseServiceImpl<Task, TaskFilter, TaskRepo>
        implements ITaskService {

    TaskRepo taskRepo;
    TaskHistoryRepo taskHistoryRepo;
    IUserService userService;
    DepartmentRepo departmentRepo;
    ProjectRepo projectRepo;
    IDepartmentService<Department, ?> departmentService;
    UserRepo userRepo;

    public TaskServiceImpl(TaskRepo repo, 
                          TaskHistoryRepo historyRepo, 
                          IUserService userService, 
                          DepartmentRepo departmentRepo,
        ProjectRepo projectRepo, IDepartmentService<Department, ?> departmentService,
                          UserRepo userRepo) {
        super(repo);
        this.taskRepo = repo;
        this.taskHistoryRepo = historyRepo;
        this.userService = userService;
        this.departmentRepo = departmentRepo;
        this.projectRepo = projectRepo;
        this.departmentService = departmentService;
        this.userRepo = userRepo;
    }

    @Override
    @Transactional
    public TaskDTO updateTask(String uid, Long id, TaskDTO taskDTO) {
        validateTaskDTO(taskDTO);

        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Kiểm tra quyền cập nhật
        if (!uid.equals(task.getApproverId()) && !uid.equals(task.getAssigneeId())) {
            throw new RuntimeException("Không có quyền cập nhật");
        }

        if (task.getState() != AppConstants.STATUS_IN_PROGRESS) {
            throw new RuntimeException("Chỉ có thể cập nhật công việc khi đang trong trạng thái thực hiện");
        }

        Integer previousState = task.getState();
        if (taskDTO.getState() == AppConstants.STATUS_COMPLETE){
            task.setCompletedDate(new Date());
        }

        BeanUtils.copyProperties(taskDTO, task, "id", "createBy", "createDate","modifiedDate");
        task = taskRepo.save(task);
        
        handleStateChange(id, previousState, task.getState(), taskDTO);
        
        checkAndUpdateTaskCompletion(id);
        
        return convertToDTO(task);
    }

    @Override
    @Transactional
    public TaskDTO createTask(String uid, TaskDTO taskDTO) {
        validateTaskDTO(taskDTO);

        Project project = projectRepo.findById(taskDTO.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));

        Task task = new Task();
        BeanUtils.copyProperties(taskDTO, task);

        task.setStatus(AppConstants.STATUS_ACTIVE);
        task.setCreateBy(uid);
        task.setUpdateBy(uid);

        if (taskDTO.getTaskTypeId() == 2) {
            // Kiểm tra quyền tạo task chỉ khi taskTypeId == 2
            if (!uid.equals(project.getManagerId())) {
                throw new RuntimeException("Chỉ có quản lý dự án mới được phép tạo task");
            }

            task.setState(AppConstants.STATUS_IN_PROGRESS);
            task.setIsApproved(true);
            task.setApproverId(uid);
            
            Task savedTask = taskRepo.save(task);

            addTaskHistory(savedTask.getId(), null, AppConstants.STATUS_IN_PROGRESS, 
                uid, "Tạo mới công việc và chuyển sang trạng thái đang thực hiện");
            
            return convertToDTO(savedTask);
        } else {
            task.setState(AppConstants.STATUS_PENDING);
            task.setIsApproved(false);

            User currentUser = userService.getById(uid, Long.valueOf(uid));
            String[] approverInfo = determineApprover(uid, currentUser, task.getDepartmentId());
            
            task.setApproverId(approverInfo[0]);
            Task savedTask = taskRepo.save(task);
            
            addTaskHistory(savedTask.getId(), null, AppConstants.STATUS_PENDING, 
                uid, "Tạo mới Công việc và gửi phê duyệt tới " + approverInfo[1]);
            
            return convertToDTO(savedTask);
        }
    }

    @Override
    @Transactional
    public TaskDTO approveTask(String uid, Long id) {
        validateApproval(uid, id);
        
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
        
        task.setState(AppConstants.STATUS_IN_PROGRESS);
        task.setIsApproved(true);
        task.setUpdateBy(uid);
        
        Task savedTask = taskRepo.save(task);
        
        addTaskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_IN_PROGRESS,
            uid, "Phê duyệt task");

        updateTaskState(uid, id, AppConstants.STATUS_IN_PROGRESS, "Chuyển sang trạng thái đang thực hiện");
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO rejectTask(String uid, Long id, String reason) {
        validateRejection(uid, id);
        
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
        
        task.setState(AppConstants.STATUS_REJECTED);
        task.setIsApproved(false);
        task.setUpdateBy(uid);
        
        Task savedTask = taskRepo.save(task);
        
        addTaskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_REJECTED, 
            uid, "Từ chối task: " + reason);
        
        return convertToDTO(savedTask);
    }

    /**
     * Kiểm tra và cập nhật trạng thái hoàn thành công việc dựa vào thời hạn.
     * Nếu công việc đang thực hiện và đã quá hạn thì chuyển sang QUÁ HẠN.
     */
    @Override
    @Transactional
    public void checkAndUpdateTaskCompletion(Long taskId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
                
        if (task.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        if (isOverdue(task)) {
            task.setCompletedDate(new Date());
            updateTaskState(AppConstants.SYSTEM, taskId, AppConstants.STATUS_OVERDUE,
                "Tự động cập nhật trạng thái quá hạn do đã vượt thời hạn task");
        }
    }

    /**
     * Xóa mềm công việc (chuyển trạng thái sang INACTIVE), chỉ cho phép khi công việc ở trạng thái CHỜ DUYỆT hoặc ĐÃ TỪ CHỐI.
     */
    @Override
    public void changeStatus(String uid, Long id) {
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc"));
            
        // Kiểm tra quyền xóa
        if (!uid.equals(task.getApproverId())) {
            throw new RuntimeException("Không có quyền xóa");
        }

        if (!canDelete(task.getState())) {
            throw new RuntimeException("Chỉ có thể xóa công việc ở trạng thái chờ duyệt hoặc từ chối");
        }

        task.setStatus(AppConstants.STATUS_INACTIVE);
        task.setUpdateBy(uid);
        taskRepo.save(task);
        
        addTaskHistory(id, task.getState(), task.getState(), uid, "Xóa công việc");
    }

    @Override
    public Page<Task> getPendingApprovalTasks(String approverId, TaskFilter filter, Pageable pageable) {
        return taskRepo.findPendingApprovalTasks(
            AppConstants.STATUS_ACTIVE,
            AppConstants.STATUS_PENDING,
            approverId,
            filter.getSearch(),
            pageable
        );
    }

    /**
     * Tìm kiếm công việc theo phòng ban, kiểm soát truy cập theo quyền.
     * - Admin và trưởng phòng ban gốc có thể xem tất cả công việc
     * - Người dùng khác chỉ xem được công việc trong phòng ban và phòng ban con
     */
    @Override
    public Page<Task> searchAll(Long departmentId, String uid, TaskFilter filter, Pageable pageable) {
        User user = userService.getById(uid, Long.valueOf(uid));

        Page<Task> taskPage;
        if (hasFullAccess(user, departmentId)) {
            taskPage = taskRepo.searchByCodeOrName(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                pageable
            );
        } else {
            List<Long> departmentIds = getDepartmentAndSubDepartmentIds(departmentId);
            taskPage = taskRepo.searchByCodeOrNameAndDepartments(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                departmentIds,
                pageable
            );
        }

        // Kiểm tra và cập nhật trạng thái cho từng task
        for (Task task : taskPage.getContent()) {
            checkAndUpdateTaskCompletion(task.getId());
        }

        return taskPage;
    }

    @Override
    public void addTaskHistory(Long taskId, Integer previousState, Integer newState, String changedBy, String comment) {
        TaskHistory history = TaskHistory.builder()
            .taskId(taskId)
            .previousState(previousState)
            .newState(newState)
            .changedBy(changedBy)
            .changedAt(new Date())
            .comment(comment)
            .build();
        taskHistoryRepo.save(history);
    }

    @Override
    public List<TaskHistoryDTO> getTaskHistory(Long taskId) {
        List<TaskHistory> histories = taskHistoryRepo.findByTaskIdOrderByChangedAtDesc(taskId);
        return histories.stream()
            .map(this::convertHistoryToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Kiểm tra tính hợp lệ của dữ liệu TaskDTO.
     */
    private void validateTaskDTO(TaskDTO taskDTO) {
        if (taskDTO == null) {
            throw new IllegalArgumentException("Task data cannot be null");
        }
    }

    /**
     * Kiểm tra quyền phê duyệt công việc.
     * Xác nhận trạng thái công việc và quyền của người phê duyệt.
     */
    private void validateApproval(String uid, Long id) {
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        if (task.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Công việc phải ở trạng thái chờ duyệt");
        }
        
        if (!uid.equals(task.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền phê duyệt task này");
        }
    }

    /**
     * Kiểm tra quyền từ chối công việc.
     * Xác nhận trạng thái công việc và quyền của người từ chối.
     */
    private void validateRejection(String uid, Long id) {
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Công việc"));
            
        if (task.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Công việc phải ở trạng thái chờ duyệt để có thể từ chối");
        }
        
        if (!uid.equals(task.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền từ chối task này");
        }
    }

    /**
     * Xác định người phê duyệt phù hợp dựa vào cấu trúc phòng ban.
     * - Admin: tự phê duyệt
     * - Phòng ban con: tự phê duyệt
     * - Cùng phòng ban: trưởng phòng ban cha phê duyệt
     */
    private String[] determineApprover(String uid, User currentUser, Long departmentId) {
        String approverId;
        String approverName;
        
        if (currentUser.getRole().equals("1")) {
            approverId = uid;
            approverName = userService.getUserDisplayName(uid);
        } else {
            Department taskDepartment = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));
            
            Department userDepartment = departmentRepo.findById(currentUser.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban của người dùng"));

            if (isSubDepartment(taskDepartment.getId(), userDepartment.getId())) {
                approverId = uid;
                approverName = userService.getUserDisplayName(uid);
            } else if (taskDepartment.getId().equals(userDepartment.getId())) {
                if (userDepartment.getParentId() == null) {
                    // Nếu user thuộc phòng ban root, tìm trưởng phòng của chính phòng ban đó
                    User departmentHead = userRepo.findByDepartmentIdAndPositionIdAndStatus(
                        userDepartment.getId(),
                        AppConstants.POSITION_HEAD,
                        AppConstants.STATUS_ACTIVE
                    ).stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy trưởng phòng ban"));
                    
                    approverId = departmentHead.getId().toString();
                    approverName = userService.getUserDisplayName(approverId);
                } else {
                    // Nếu không phải phòng ban root, tìm trưởng phòng ban cha
                    Department parentDepartment = departmentRepo.findById(taskDepartment.getParentId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban cha"));
                    
                    User departmentHead = userRepo.findByDepartmentIdAndPositionIdAndStatus(
                        parentDepartment.getId(),
                        AppConstants.POSITION_HEAD,
                        AppConstants.STATUS_ACTIVE
                    ).stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy trưởng phòng ban cha"));
                    
                    approverId = departmentHead.getId().toString();
                    approverName = userService.getUserDisplayName(approverId);
                }
            } else {
                throw new RuntimeException("Không có quyền tạo task cho phòng ban này");
            }
        }
        
        return new String[]{approverId, approverName};
    }

    /**
     * Xử lý thay đổi trạng thái và ghi lịch sử.
     */
    private void handleStateChange(Long id, Integer previousState, Integer newState, TaskDTO taskDTO) {
        if (!Objects.equals(previousState, newState)) {
            String stateChangeComment = String.format(
                "Cập nhật trạng thái %s sang %s%s",
                StateNameUtils.getTaskStateName(previousState),
                StateNameUtils.getTaskStateName(newState),
                taskDTO.getComment() != null ? " - " + taskDTO.getComment() : ""
            );
            
            addTaskHistory(
                id, 
                previousState, 
                newState, 
                taskDTO.getUpdateBy(), 
                stateChangeComment
            );
        }
    }

    private boolean canDelete(Integer state) {
        return state == AppConstants.STATUS_PENDING || state == AppConstants.STATUS_REJECTED;
    }

    /**
     * Kiểm tra công việc có quá hạn không.
     * @return true nếu ngày hết hạn đã qua
     */
    private boolean isOverdue(Task task) {
        return task.getDueDate() != null && new Date().after(task.getDueDate());
    }

    /**
     * Kiểm tra người dùng có quyền truy cập đầy đủ công việc.
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
     * Cập nhật trạng thái công việc với kiểm tra và ghi lịch sử.
     */
    private void updateTaskState(String uid, Long id, Integer newState, String comment) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Công việc"));
                
        Integer previousState = task.getState();
        task.setState(newState);
        task.setUpdateBy(uid);
        
        if (newState == AppConstants.STATUS_COMPLETE) {
            task.setCompletedDate(new Date());
        }
        
        taskRepo.save(task);
        
        addTaskHistory(id, previousState, newState, uid, comment);
    }

    /**
     * Kiểm tra một phòng ban có phải là phòng ban con của phòng ban khác.
     * @return true nếu departmentId là phòng ban con của parentId
     */
    private boolean isSubDepartment(Long departmentId, Long parentId) {
        List<Department> subDepartments = departmentService.getAllSubDepartments(parentId);
        return subDepartments.stream()
            .anyMatch(dept -> dept.getId().equals(departmentId));
    }

    /**
     * Chuyển đổi Task entity thành TaskDTO.
     * Bao gồm tên trạng thái, tên người được giao và tên người phê duyệt.
     */
    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setCode(task.getCode());
        dto.setName(task.getName());
        dto.setState(task.getState());
        dto.setDepartmentId(task.getDepartmentId());
        dto.setProjectId(task.getProjectId());
        dto.setRiskId(task.getRiskId());
        dto.setPriorityId(task.getPriorityId());
        dto.setStartDate(task.getStartDate());
        dto.setDueDate(task.getDueDate());
        dto.setAssigneeId(task.getAssigneeId());
        dto.setApproverId(task.getApproverId());
        
        dto.setStateName(StateNameUtils.getTaskStateName(task.getState()));
        dto.setAssigneeName(userService.getUserDisplayName(task.getAssigneeId()));
        dto.setApproverName(userService.getUserDisplayName(task.getApproverId()));
        
        return dto;
    }

    /**
     * Chuyển đổi TaskHistory entity thành TaskHistoryDTO.
     * Bao gồm tên người thay đổi và tên trạng thái.
     */
    private TaskHistoryDTO convertHistoryToDTO(TaskHistory history) {
        TaskHistoryDTO dto = new TaskHistoryDTO();
        dto.setId(history.getId());
        dto.setTaskId(history.getTaskId());
        dto.setPreviousState(history.getPreviousState());
        dto.setNewState(history.getNewState());
        dto.setChangedBy(history.getChangedBy());
        dto.setChangedAt(history.getChangedAt());
        dto.setComment(history.getComment());
        
        dto.setPreviousStateName(StateNameUtils.getTaskStateName(history.getPreviousState()));
        dto.setStateName(StateNameUtils.getTaskStateName(history.getNewState()));
        
        if (history.getChangedBy() != null) {
            if (history.getChangedBy().equals(AppConstants.SYSTEM)) {
                dto.setChangedByName("Hệ thống");
            } else {
                dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
            }
        }
        
        return dto;
    }

    @Override
    public List<Task> getTasksByProjectId(String uid, Long projectId) {
        List<Task> tasks = taskRepo.findByProjectIdAndStatus(projectId, 1);
        
        // Kiểm tra và cập nhật trạng thái cho từng task
        for (Task task : tasks) {
            checkAndUpdateTaskCompletion(task.getId());
        }
        
        return tasks;
    }

    @Override
    public List<Task> getTasksByRiskId(String uid, Long riskId) {
        List<Task> tasks = taskRepo.findByRiskIdAndStatus(riskId, 1);
        
        // Kiểm tra và cập nhật trạng thái cho từng task
        for (Task task : tasks) {
            checkAndUpdateTaskCompletion(task.getId());
        }
        
        return tasks;
    }

    @Override
    public Task getById(String uid, Long id) {
        Task task = super.getById(uid, id);
        checkAndUpdateTaskCompletion(id);
        return task;
    }
} 