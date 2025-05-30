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
import org.springframework.util.StringUtils;

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
    IDepartmentService<Department, ?> departmentService;
    UserRepo userRepo;

    public TaskServiceImpl(TaskRepo repo, 
                          TaskHistoryRepo historyRepo, 
                          IUserService userService, 
                          DepartmentRepo departmentRepo, 
                          IDepartmentService<Department, ?> departmentService,
                          UserRepo userRepo) {
        super(repo);
        this.taskRepo = repo;
        this.taskHistoryRepo = historyRepo;
        this.userService = userService;
        this.departmentRepo = departmentRepo;
        this.departmentService = departmentService;
        this.userRepo = userRepo;
    }

    /**
     * Cập nhật thông tin công việc, chỉ cho phép khi đang ở trạng thái ĐANG THỰC HIỆN.
     * - Kiểm tra trạng thái công việc
     * - Cập nhật thông tin
     * - Ghi lịch sử thay đổi
     * 
     * @param id ID công việc cần cập nhật
     * @param taskDTO Thông tin công việc mới
     * @return TaskDTO sau khi cập nhật
     */
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

    /**
     * Tạo mới một công việc và khởi tạo quy trình phê duyệt.
     * - Đặt trạng thái ban đầu là CHỜ DUYỆT
     * - Xác định người phê duyệt phù hợp theo phòng ban
     * - Ghi lịch sử tạo công việc
     * 
     * @param uid ID người tạo công việc
     * @param taskDTO Thông tin công việc
     * @return TaskDTO vừa tạo
     */
    @Override
    @Transactional
    public TaskDTO createTask(String uid, TaskDTO taskDTO) {
        validateTaskDTO(taskDTO);

        Task task = new Task();
        BeanUtils.copyProperties(taskDTO, task);

        task.setStatus(AppConstants.STATUS_ACTIVE);
        task.setState(AppConstants.STATUS_PENDING);
        task.setCreateBy(uid);
        task.setIsApproved(false);
        task.setUpdateBy(uid);

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

        updateTaskState(uid, id, AppConstants.STATUS_IN_PROGRESS, uid, "Tự động chuyển sang trạng thái đang thực hiện");
        
        return convertToDTO(savedTask);
    }

    /**
     * Từ chối công việc, chuyển trạng thái sang ĐÃ TỪ CHỐI.
     * @param uid ID người từ chối
     * @param id ID công việc
     * @param reason Lý do từ chối
     * @return TaskDTO sau khi bị từ chối
     */
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
     * @param taskId ID công việc cần kiểm tra
     */
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

    /**
     * Xóa mềm công việc (chuyển trạng thái sang INACTIVE), chỉ cho phép khi công việc ở trạng thái CHỜ DUYỆT hoặc ĐÃ TỪ CHỐI.
     * @param uid ID người thực hiện xóa
     * @param id ID công việc cần xóa
     */
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
        taskRepo.save(task);
        
        addTaskHistory(id, task.getState(), task.getState(), uid, "Xóa task");
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
     * 
     * @param departmentId ID phòng ban
     * @param uid ID người dùng
     * @param filter Bộ lọc tìm kiếm
     * @param pageable Thông tin phân trang
     * @return Danh sách công việc phù hợp
     */
    @Override
    public Page<Task> searchAll(Long departmentId, String uid, TaskFilter filter, Pageable pageable) {
        
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
        validateId(taskId);
        List<TaskHistory> histories = taskHistoryRepo.findByTaskIdOrderByChangedAtDesc(taskId);
        return histories.stream()
            .map(this::convertHistoryToDTO)
            .collect(Collectors.toList());
    }

    // Private helper methods

    /**
     * Kiểm tra tính hợp lệ của dữ liệu TaskDTO.
     * @throws IllegalArgumentException nếu dữ liệu không hợp lệ
     */
    private void validateTaskDTO(TaskDTO taskDTO) {
        if (taskDTO == null) {
            throw new IllegalArgumentException("Task data cannot be null");
        }
    }

    /**
     * Kiểm tra ID có hợp lệ (dương và không null).
     * @throws IllegalArgumentException nếu ID không hợp lệ
     */
    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid ID");
        }
    }

    /**
     * Kiểm tra việc gửi phê duyệt công việc.
     * Xác nhận danh sách người phê duyệt và trạng thái công việc.
     */
    private void validateSubmitForApproval(String uid, Long id, List<Long> approverIds) {
        if (approverIds == null || approverIds.isEmpty()) {
            throw new RuntimeException("Phải chỉ định người phê duyệt");
        }
        validateId(id);
    }

    /**
     * Kiểm tra quyền phê duyệt công việc.
     * Xác nhận trạng thái công việc và quyền của người phê duyệt.
     */
    private void validateApproval(String uid, Long id) {
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

    /**
     * Kiểm tra quyền từ chối công việc.
     * Xác nhận trạng thái công việc và quyền của người từ chối.
     */
    private void validateRejection(String uid, Long id) {
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

    /**
     * Xác định người phê duyệt phù hợp dựa vào cấu trúc phòng ban.
     * - Admin: tự phê duyệt
     * - Phòng ban con: tự phê duyệt
     * - Cùng phòng ban: trưởng phòng ban cha phê duyệt
     * 
     * @return Mảng String [approverId, approverName]
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

    /**
     * Xử lý thay đổi trạng thái và ghi lịch sử.
     * @param id ID công việc
     * @param previousState Trạng thái trước
     * @param newState Trạng thái mới
     * @param taskDTO Thông tin công việc
     */
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

    /**
     * Kiểm tra công việc có quá hạn không.
     * @return true nếu ngày hết hạn đã qua
     */
    private boolean isOverdue(Task task) {
        return task.getDueDate() != null && new Date().after(task.getDueDate());
    }

    /**
     * Kiểm tra công việc có thể xóa dựa vào trạng thái.
     * @return true nếu công việc ở trạng thái CHỜ DUYỆT hoặc ĐÃ TỪ CHỐI
     */
    private boolean canDelete(Integer state) {
        return state == AppConstants.STATUS_PENDING || state == AppConstants.STATUS_REJECTED;
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
     * @param uid ID người thay đổi
     * @param id ID công việc
     * @param newState Trạng thái mới
     * @param changedBy Người thay đổi
     * @param comment Ghi chú thay đổi
     */
    private void updateTaskState(String uid, Long id, Integer newState, String changedBy, String comment) {
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy task"));
                
        Integer previousState = task.getState();
        task.setState(newState);
        task.setUpdateBy(changedBy);
        
        if (newState == AppConstants.STATUS_COMPLETE) {
            task.setCompletedDate(new Date());
        }
        
        taskRepo.save(task);
        
        addTaskHistory(id, previousState, newState, changedBy, comment);
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
            dto.setChangedByName(userService.getUserDisplayName(history.getChangedBy()));
        }
        
        return dto;
    }
} 