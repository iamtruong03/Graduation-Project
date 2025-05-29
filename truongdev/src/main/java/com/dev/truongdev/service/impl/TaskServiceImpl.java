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

import java.util.Date;
import java.util.List;
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

    public TaskServiceImpl(TaskRepo repo, TaskHistoryRepo historyRepo, IUserService userService, DepartmentRepo departmentRepo, IDepartmentService<Department, ?> departmentService) {
        super(repo);
        this.taskRepo = repo;
        this.taskHistoryRepository = historyRepo;
        this.userService = userService;
        this.departmentRepo = departmentRepo;
        this.departmentService = departmentService;
    }

    @Override
    @Transactional
    public TaskDTO createTask(String uid, TaskDTO taskDTO) {
        Task task = new Task();
        BeanUtils.copyProperties(taskDTO, task);
        
        // Set initial state
        task.setState(AppConstants.STATUS_PENDING);
        task.setCreateBy(uid);

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
            Department taskDepartment = departmentRepo.findById(task.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));
            
            Department userDepartment = departmentRepo.findById(currentUser.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban của người dùng"));

            if (isSubDepartment(taskDepartment.getId(), userDepartment.getId())) {
                // Nếu tạo cho phòng ban con/cháu/chắt -> người tạo tự duyệt
                approverId = uid;
                approverName = userService.getUserDisplayName(uid);
            } else if (taskDepartment.getId().equals(userDepartment.getId())) {
                // Nếu tạo cho chính phòng ban của mình -> trưởng phòng ban cha duyệt
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
        
        // Set approver
        task.setApproverId(approverId);
        
        Task savedTask = taskRepo.save(task);
        
        // Log history
        addTaskHistory(savedTask.getId(), null, AppConstants.STATUS_PENDING, 
            uid, "Tạo mới task và gửi phê duyệt tới " + approverName);
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO submitForApproval(String uid, Long id, List<Long> approverIds) {
        if (approverIds == null || approverIds.isEmpty()) {
            throw new RuntimeException("Phải chỉ định người phê duyệt");
        }
        
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        if (task.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Task phải ở trạng thái chờ duyệt");
        }
        
        // Chỉ lấy người phê duyệt đầu tiên
        task.setApproverId(approverIds.get(0).toString());
        task.setUpdateBy(uid);
        task.setModifiedDate(new Date());
        
        Task savedTask = taskRepo.save(task);
        
        // Log history
        addTaskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_PENDING, 
            uid, "Đã chỉ định người phê duyệt: " + task.getApproverId());
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO approveTask(String uid, Long id, String approvedBy) {
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        if (task.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Task phải ở trạng thái chờ duyệt");
        }
        
        // Kiểm tra quyền phê duyệt
        if (!uid.equals(task.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền phê duyệt task này");
        }
        
        // Cập nhật trạng thái
        task.setState(AppConstants.STATUS_APPROVED);
        task.setUpdateBy(uid);
        task.setModifiedDate(new Date());
        
        Task savedTask = taskRepo.save(task);
        
        // Log history
        addTaskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_APPROVED, 
            uid, "Phê duyệt task");

        // Tự động chuyển sang trạng thái IN_PROGRESS
        updateTaskState(uid, id, AppConstants.STATUS_IN_PROGRESS, uid, "Tự động chuyển sang trạng thái đang thực hiện");
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO rejectTask(String uid, Long id, String reason) {
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        if (task.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Task phải ở trạng thái chờ duyệt để có thể từ chối");
        }
        
        // Kiểm tra quyền từ chối
        if (!uid.equals(task.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền từ chối task này");
        }
        
        task.setState(AppConstants.STATUS_REJECTED);
        task.setUpdateBy(uid);
        task.setModifiedDate(new Date());
        
        Task savedTask = taskRepo.save(task);
        
        // Log history
        addTaskHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_REJECTED, 
            uid, "Từ chối task: " + reason);
        
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public void checkAndUpdateTaskCompletion(Long taskId) {
        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
                
        // Chỉ kiểm tra khi task đang trong trạng thái IN_PROGRESS
        if (task.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        // Kiểm tra thời hạn task
        Date now = new Date();
        if (task.getDueDate() != null) {
            if (now.after(task.getDueDate())) {
                // Nếu quá hạn
                updateTaskState(AppConstants.SYSTEM, taskId, AppConstants.STATUS_OVERDUE, 
                    AppConstants.SYSTEM, "Tự động cập nhật trạng thái quá hạn do đã vượt thời hạn task");
            }
        }
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
        
        // Log history
        addTaskHistory(id, previousState, newState, changedBy, comment);
    }

    private boolean isSubDepartment(Long departmentId, Long parentId) {
        List<Department> subDepartments = departmentService.getAllSubDepartments(parentId);
        return subDepartments.stream()
            .anyMatch(dept -> dept.getId().equals(departmentId));
    }

    @Override
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return convertToDTO(task);
    }

    @Override
    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        Integer previousState = task.getState();
        
        // Update task fields
        task.setState(taskDTO.getState());
        task.setDepartmentId(taskDTO.getDepartmentId());
        task.setProjectId(taskDTO.getProjectId());
        task.setPriorityId(taskDTO.getPriorityId());
        task.setStartDate(taskDTO.getStartDate());
        task.setDueDate(taskDTO.getDueDate());
        task.setCompletedDate(taskDTO.getCompletedDate());
        task.setAssigneeId(taskDTO.getAssigneeId());
        task.setApproverId(taskDTO.getApproverId());
        
        task = taskRepo.save(task);
        
        // Add history if state changed
        if (!previousState.equals(task.getState())) {
            addTaskHistory(id, previousState, task.getState(), taskDTO.getUpdateBy(), "Cập nhật trạng thái");
        }
        
        return convertToDTO(task);
    }

    @Override
    public List<TaskHistoryDTO> getTaskHistory(Long taskId) {
        return taskHistoryRepository.findByTaskIdOrderByChangedAtDesc(taskId)
                .stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
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
        taskHistoryRepository.save(history);
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
        
        // Set display names
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
        
        // Set display names
        dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        dto.setStateName(StateNameUtils.getTaskStateName(history.getNewState()));
        
        return dto;
    }

    @Override
    public Page<Task> searchAll(Long departmentId, String uid, TaskFilter filter, Pageable pageable) {
        // Lấy user
        User user = userService.getById(uid, Long.valueOf(uid));

        Page<Task> page;

        // Kiểm tra quyền admin hoặc phòng ban gốc
        if (user.getRole().equals("ROLE_ADMIN") ||
            (departmentRepo.findById(departmentId).get().getParentId() == null)) {
            // Tìm kiếm toàn bộ task
            page = taskRepo.searchByCodeOrName(
                1, // STATUS_ACTIVE
                filter.getSearch(),
                pageable
            );
        } else {
            // Tìm kiếm trong phòng ban và phòng ban con
            Department department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));

            List<Long> departmentIds = new java.util.ArrayList<>();
            departmentIds.add(departmentId);
            departmentIds.addAll(
                departmentService.getAllSubDepartments(departmentId).stream()
                    .map(Department::getId)
                    .collect(java.util.stream.Collectors.toList())
            );

            page = taskRepo.searchByCodeOrNameAndDepartments(
                1, // STATUS_ACTIVE
                filter.getSearch(),
                departmentIds,
                pageable
            );
        }
        return page;
        // Nếu muốn trả về Page<TaskDTO> thì cần map như page.map(this::convertToDTO)
    }

    @Override
    public void changeStatus(String uid, Long id) {
        Task task = taskRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
            
        // Chỉ cho phép xóa mềm ở trạng thái chờ duyệt hoặc từ chối
        if (task.getState() != AppConstants.STATUS_PENDING && 
            task.getState() != AppConstants.STATUS_REJECTED) {
            throw new RuntimeException("Chỉ có thể xóa task ở trạng thái chờ duyệt hoặc từ chối");
        }

        task.setStatus(AppConstants.STATUS_INACTIVE);
        task.setUpdateBy(uid);
        task.setModifiedDate(new Date());
        taskRepo.save(task);
        
        // Log history
        addTaskHistory(id, task.getState(), task.getState(), uid, "Xóa task");
    }
} 