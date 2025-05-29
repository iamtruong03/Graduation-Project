package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.TaskDTO;
import com.dev.truongdev.dto.TaskHistoryDTO;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.entity.TaskHistory;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.repo.TaskHistoryRepo;
import com.dev.truongdev.repo.TaskRepo;
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
import org.springframework.util.StringUtils;

import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskServiceImpl extends XDevBaseServiceImpl<Task, TaskFilter, TaskRepo>
        implements ITaskService {

    final TaskRepo taskRepo;
    final TaskHistoryRepo taskHistoryRepository;
    final IUserService userService;
    final DepartmentRepo departmentRepo;
    final IDepartmentService<Department, ?> departmentService;

    public TaskServiceImpl(TaskRepo repo, TaskHistoryRepo historyRepo, IUserService userService, 
            DepartmentRepo departmentRepo, IDepartmentService<Department, ?> departmentService) {
        super(repo);
        this.taskRepo = repo;
        this.taskHistoryRepository = historyRepo;
        this.userService = userService;
        this.departmentRepo = departmentRepo;
        this.departmentService = departmentService;
    }

    @Override
    public TaskDTO getTaskById(Long id) {
        validateId(id);
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return convertToDTO(task);
    }

    @Override
    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        validateTaskDTO(taskDTO);
        validateId(id);

        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (task.getState() != AppConstants.STATUS_IN_PROGRESS) {
            throw new RuntimeException("Chỉ có thể cập nhật task khi đang trong trạng thái thực hiện");
        }

        Integer previousState = task.getState();
        
        BeanUtils.copyProperties(taskDTO, task, "id", "createBy", "createDate", "state");
        task = taskRepo.save(task);
        
        handleStateChange(id, previousState, task.getState(), taskDTO);
        
        return convertToDTO(task);
    }

    @Override
    @Transactional
    public TaskDTO createTask(String uid, TaskDTO taskDTO) {
        validateTaskDTO(taskDTO);
        validateUserId(uid);

        Task task = new Task();
        BeanUtils.copyProperties(taskDTO, task);
        
        task.setState(AppConstants.STATUS_PENDING);
        task.setCreateBy(uid);

        User currentUser = userService.getById(uid, Long.valueOf(uid));
        String[] approverInfo = determineApprover(uid, currentUser, task.getDepartmentId());
        
        task.setApproverId(approverInfo[0]);
        Task savedTask = taskRepo.save(task);
        
        addTaskHistory(savedTask.getId(), null, AppConstants.STATUS_PENDING, 
            uid, "Tạo mới task và gửi phê duyệt tới " + approverInfo[1]);
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO submitForApproval(String uid, Long id, List<Long> approverIds) {
        validateSubmitForApproval(uid, id, approverIds);
        
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        task.setApproverId(approverIds.get(0).toString());
        task.setUpdateBy(uid);
        task.setModifiedDate(new Date());
        
        Task savedTask = taskRepo.save(task);
        
        addTaskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_PENDING, 
            uid, "Đã chỉ định người phê duyệt: " + task.getApproverId());
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO approveTask(String uid, Long id, String approvedBy) {
        validateApproval(uid, id);
        
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
        
        task.setState(AppConstants.STATUS_APPROVED);
        task.setUpdateBy(uid);
        task.setModifiedDate(new Date());
        
        Task savedTask = taskRepo.save(task);
        
        addTaskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_APPROVED, 
            uid, "Phê duyệt task");

        updateTaskState(uid, id, AppConstants.STATUS_IN_PROGRESS, uid, "Tự động chuyển sang trạng thái đang thực hiện");
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO rejectTask(String uid, Long id, String reason) {
        validateRejection(uid, id);
        
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
        
        task.setState(AppConstants.STATUS_REJECTED);
        task.setUpdateBy(uid);
        task.setModifiedDate(new Date());
        
        Task savedTask = taskRepo.save(task);
        
        addTaskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_REJECTED, 
            uid, "Từ chối task: " + reason);
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public void checkAndUpdateTaskCompletion(Long taskId) {
        validateId(taskId);
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
                
        if (task.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        if (isOverdue(task)) {
            updateTaskState(AppConstants.SYSTEM, taskId, AppConstants.STATUS_OVERDUE, 
                AppConstants.SYSTEM, "Tự động cập nhật trạng thái quá hạn do đã vượt thời hạn task");
        }
    }

    @Override
    public void changeStatus(String uid, Long id) {
        validateId(id);
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        if (!canDelete(task.getState())) {
            throw new RuntimeException("Chỉ có thể xóa task ở trạng thái chờ duyệt hoặc từ chối");
        }

        task.setStatus(AppConstants.STATUS_INACTIVE);
        task.setUpdateBy(uid);
        task.setModifiedDate(new Date());
        taskRepo.save(task);
        
        addTaskHistory(id, task.getState(), task.getState(), uid, "Xóa task");
    }

    @Override
    public Page<Task> getPendingApprovalTasks(String approverId, TaskFilter filter, Pageable pageable) {
        validateUserId(approverId);
        return taskRepo.findPendingApprovalTasks(
            AppConstants.STATUS_ACTIVE,
            AppConstants.STATUS_PENDING,
            approverId,
            filter.getSearch(),
            pageable
        );
    }

    @Override
    public Page<Task> searchAll(Long departmentId, String uid, TaskFilter filter, Pageable pageable) {
        validateDepartmentId(departmentId);
        validateUserId(uid);
        
        User user = userService.getById(uid, Long.valueOf(uid));

        if (hasFullAccess(user, departmentId)) {
            return taskRepo.searchByCodeOrName(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                pageable
            );
        }

        List<Long> departmentIds = getDepartmentAndSubDepartmentIds(departmentId);
        return taskRepo.searchByCodeOrNameAndDepartments(
            AppConstants.STATUS_ACTIVE,
            filter.getSearch(),
            departmentIds,
            pageable
        );
    }

    // Private helper methods
    private void validateTaskDTO(TaskDTO taskDTO) {
        if (taskDTO == null) {
            throw new IllegalArgumentException("Task data cannot be null");
        }
        if (taskDTO.getState() == null) {
            throw new IllegalArgumentException("Task state cannot be null");
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
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        if (task.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Task phải ở trạng thái chờ duyệt");
        }
        
        if (!uid.equals(task.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền phê duyệt task này");
        }
    }

    private void validateRejection(String uid, Long id) {
        validateUserId(uid);
        validateId(id);
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        if (task.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Task phải ở trạng thái chờ duyệt để có thể từ chối");
        }
        
        if (!uid.equals(task.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền từ chối task này");
        }
    }

    private String[] determineApprover(String uid, User currentUser, Long departmentId) {
        String approverId;
        String approverName;
        
        if (currentUser.getRole().equals("ROLE_ADMIN")) {
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
            } else {
                throw new RuntimeException("Không có quyền tạo task cho phòng ban này");
            }
        }
        
        return new String[]{approverId, approverName};
    }

    private void handleStateChange(Long id, Integer previousState, Integer newState, TaskDTO taskDTO) {
        if (!Objects.equals(previousState, newState)) {
            String stateChangeComment = String.format(
                "State changed from %s to %s%s",
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

    private boolean isOverdue(Task task) {
        return task.getDueDate() != null && new Date().after(task.getDueDate());
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

    private void updateTaskState(String uid, Long id, Integer newState, String changedBy, String comment) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
                
        Integer previousState = task.getState();
        task.setState(newState);
        task.setUpdateBy(changedBy);
        task.setModifiedDate(new Date());
        
        if (newState == AppConstants.STATUS_COMPLETE) {
            task.setCompletedDate(new Date());
        }
        
        taskRepo.save(task);
        
        addTaskHistory(id, previousState, newState, changedBy, comment);
    }

    private boolean isSubDepartment(Long departmentId, Long parentId) {
        List<Department> subDepartments = departmentService.getAllSubDepartments(parentId);
        return subDepartments.stream()
            .anyMatch(dept -> dept.getId().equals(departmentId));
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setCode(task.getCode());
        dto.setName(task.getName());
        dto.setState(task.getState());
        dto.setDepartmentId(task.getDepartmentId());
        dto.setProjectId(task.getProjectId());
        dto.setPriorityId(task.getPriorityId());
        dto.setStartDate(task.getStartDate());
        dto.setDueDate(task.getDueDate());
        dto.setCompletedDate(task.getCompletedDate());
        dto.setAssigneeId(task.getAssigneeId());
        dto.setApproverId(task.getApproverId());
        
        dto.setStateName(StateNameUtils.getTaskStateName(task.getState()));
        dto.setAssigneeName(userService.getUserDisplayName(task.getAssigneeId()));
        dto.setApproverName(userService.getUserDisplayName(task.getApproverId()));
        
        return dto;
    }

    private TaskHistoryDTO convertHistoryToDTO(TaskHistory history) {
        TaskHistoryDTO dto = new TaskHistoryDTO();
        dto.setId(history.getId());
        dto.setTaskId(history.getTaskId());
        dto.setPreviousState(history.getPreviousState());
        dto.setNewState(history.getNewState());
        dto.setChangedBy(history.getChangedBy());
        dto.setChangedAt(history.getChangedAt());
        dto.setComment(history.getComment());
        
        dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        dto.setStateName(StateNameUtils.getTaskStateName(history.getNewState()));
        
        return dto;
    }
} 