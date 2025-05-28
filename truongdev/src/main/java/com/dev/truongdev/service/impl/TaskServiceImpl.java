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
import com.dev.truongdev.payload.filter.TaskFilter;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
} 