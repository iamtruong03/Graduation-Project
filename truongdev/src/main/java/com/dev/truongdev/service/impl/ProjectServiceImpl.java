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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
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
    @Transactional
    public ProjectDTO createProject(String uid, ProjectDTO projectDTO) {
        Project project = new Project();
        BeanUtils.copyProperties(projectDTO, project);
        
        // Set initial state
        project.setState(AppConstants.STATUS_PENDING);
        project.setIsApproved(false);
        project.setCreateBy(uid);

        // Get current user
        User currentUser = userRepo.findById(Long.valueOf(uid))
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        String approverId;
        String approverName;
        
        if (currentUser.getRole().equals("ROLE_ADMIN")) {
            // Admin tự phê duyệt
            approverId = uid;
            approverName = userService.getUserDisplayName(uid);
        } else {
            // Get department info
            Department projectDepartment = departmentRepo.findById(project.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));
            
            Department userDepartment = departmentRepo.findById(currentUser.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban của người dùng"));

            if (isSubDepartment(projectDepartment.getId(), userDepartment.getId())) {
                // Nếu tạo cho phòng ban con/cháu/chắt -> người tạo tự duyệt
                approverId = uid;
                approverName = userService.getUserDisplayName(uid);
            } else if (projectDepartment.getId().equals(userDepartment.getId())) {
                // Nếu tạo cho chính phòng ban của mình -> trưởng phòng ban cha duyệt
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
        
        // Set approver
        project.setApproverId(approverId);
        
        Project savedProject = projectRepo.save(project);
        
        // Log history
        createProjectHistory(savedProject.getId(), null, AppConstants.STATUS_PENDING, 
            uid, "Tạo mới dự án và gửi phê duyệt tới " + approverName);
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public ProjectDTO submitForApproval(String uid, Long id, List<Long> approverIds) {
        if (approverIds == null || approverIds.isEmpty()) {
            throw new RuntimeException("Phải chỉ định người phê duyệt");
        }
        
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        if (project.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Dự án phải ở trạng thái chờ duyệt");
        }
        
        // Chỉ lấy người phê duyệt đầu tiên
        project.setApproverId(approverIds.get(0).toString());
        project.setUpdateBy(uid);
        project.setModifiedDate(new Date());
        
        Project savedProject = projectRepo.save(project);
        
        // Log history
        createProjectHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_PENDING, 
            uid, "Đã chỉ định người phê duyệt: " + project.getApproverId());
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public ProjectDTO approveProject(String uid, Long id, String approvedBy) {
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        if (project.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Dự án phải ở trạng thái chờ duyệt");
        }
        
        // Kiểm tra quyền phê duyệt
        if (!uid.equals(project.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền phê duyệt dự án này");
        }
        
        // Cập nhật trạng thái
        project.setState(AppConstants.STATUS_APPROVED);
        project.setIsApproved(true);
        project.setUpdateBy(uid);
        project.setModifiedDate(new Date());
        
        Project savedProject = projectRepo.save(project);
        
        // Log history
        createProjectHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_APPROVED, 
            uid, "Phê duyệt dự án");

        // Tự động chuyển sang trạng thái IN_PROGRESS
        updateProjectState(uid, id, AppConstants.STATUS_IN_PROGRESS, uid, "Tự động chuyển sang trạng thái đang thực hiện");
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public ProjectDTO updateProjectState(String uid, Long id, Integer newState, String changedBy, String comment) {
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        // Validate state transition
        validateStateTransition(project.getState(), newState);
            
        Integer previousState = project.getState();
        project.setState(newState);
        project.setUpdateBy(changedBy);
        project.setModifiedDate(new Date());
        
        Project savedProject = projectRepo.save(project);
        
        // Log history
        createProjectHistory(id, previousState, newState, changedBy, comment);
        
        return convertToDTO(savedProject);
    }

    @Override
    @Transactional
    public void checkAndUpdateProjectCompletion(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
                
        // Chỉ kiểm tra khi dự án đang trong trạng thái IN_PROGRESS
        if (project.getState() != AppConstants.STATUS_IN_PROGRESS) {
            return;
        }

        List<Task> tasks = taskRepo.findByProjectId(projectId);
        
        boolean allTasksCompleted = tasks.stream()
                .allMatch(task -> task.getState() == State.COMPLETED.ordinal());
                
        if (allTasksCompleted) {
            // Kiểm tra thời hạn dự án
            Date now = new Date();
            if (project.getEndDate() != null) {
                if (now.after(project.getEndDate())) {
                    // Nếu quá hạn
                    updateProjectState(AppConstants.SYSTEM, projectId, AppConstants.STATUS_OVERDUE, 
                        AppConstants.SYSTEM, "Tự động cập nhật trạng thái quá hạn do đã hoàn thành sau thời hạn");
                }
            }
        } else {
            // Kiểm tra nếu đã quá hạn
            Date now = new Date();
            if (project.getEndDate() != null && now.after(project.getEndDate())) {
                updateProjectState(AppConstants.SYSTEM, projectId, AppConstants.STATUS_OVERDUE,
                    AppConstants.SYSTEM, "Tự động cập nhật trạng thái quá hạn do đã vượt thời hạn dự án");
            }
        }
    }

    @Override
    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return convertToDTO(project);
    }

    @Override
    public List<ProjectHistoryDTO> getProjectHistory(Long projectId) {
        return projectHistoryRepo.findByProjectIdOrderByChangedAtDesc(projectId)
                .stream()
                .map(this::convertHistoryToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addProjectHistory(Long projectId, Integer previousState, Integer newState, String changedBy, String comment) {
        createProjectHistory(projectId, previousState, newState, changedBy, comment);
    }

    @Override
    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO projectDTO) {
        Project project = projectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        // Kiểm tra trạng thái dự án
        if (project.getState() != AppConstants.STATUS_IN_PROGRESS) {
            throw new RuntimeException("Chỉ có thể cập nhật dự án khi đang trong trạng thái thực hiện");
        }

        Integer previousState = project.getState();
        
        // Update project fields
        BeanUtils.copyProperties(projectDTO, project, "id", "createBy", "createDate", "state"); // Không cho phép sửa trạng thái
        project = projectRepo.save(project);
        
        // Add history
        ProjectHistory history = new ProjectHistory();
        history.setProjectId(id);
        history.setPreviousState(previousState);
        history.setNewState(project.getState());
        history.setChangedBy(project.getUpdateBy());
        history.setChangedAt(new Date());
        history.setComment("Cập nhật thông tin dự án");
        projectHistoryRepo.save(history);
        
        return convertToDTO(project);
    }

    @Override
    @Transactional
    public ProjectDTO rejectProject(String uid, Long id, String reason) {
        Project project = projectRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
            
        if (project.getState() != AppConstants.STATUS_PENDING) {
            throw new RuntimeException("Dự án phải ở trạng thái chờ duyệt để có thể từ chối");
        }
        
        // Kiểm tra quyền từ chối
        if (!uid.equals(project.getApproverId())) {
            throw new RuntimeException("Người dùng không có quyền từ chối dự án này");
        }
        
        project.setState(AppConstants.STATUS_REJECTED);
        project.setIsApproved(false);
        project.setUpdateBy(uid);
        project.setModifiedDate(new Date());
        
        Project savedProject = projectRepo.save(project);
        
        // Log history
        createProjectHistory(id, AppConstants.STATUS_PENDING, AppConstants.STATUS_REJECTED, 
            uid, "Từ chối dự án: " + reason);
        
        return convertToDTO(savedProject);
    }

    @Override
    public Page<Project> searchAll(Long departmentId, String uid, ProjectFilter filter, Pageable pageable) {
        User user = userRepo.findById(Long.valueOf(uid))
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    
        Page<Project> page;
    
        // Kiểm tra quyền xem toàn hệ thống (admin hoặc phòng ban root)
        if (user.getRole().equals("ROLE_ADMIN") ||
            (departmentRepo.findById(departmentId).get().getParentId() == null)) {
            
            // Tìm kiếm trên toàn bộ dự án
            page = projectRepo.searchByCodeOrName(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                pageable
            );
        } else {
            // Tìm kiếm trong phạm vi phòng ban và phòng ban con
            Department department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng ban"));
    
            List<Long> departmentIds = new ArrayList<>();
            departmentIds.add(departmentId);
            departmentIds.addAll(
                getAllSubDepartments(departmentId).stream()
                    .map(Department::getId)
                    .collect(Collectors.toList())
            );
    
            // Tìm kiếm dự án theo phòng ban
            page = projectRepo.searchByCodeOrNameAndDepartments(
                AppConstants.STATUS_ACTIVE,
                filter.getSearch(),
                departmentIds,
                pageable
            );
        }
    
        // Thêm kiểm tra và cập nhật trạng thái cho từng dự án
        page.getContent().forEach(project -> {
            try {
                checkAndUpdateProjectCompletion(project.getId());
            } catch (Exception e) {
                log.error("Error checking project completion for project {}: {}", 
                    project.getId(), e.getMessage());
            }
        });
    
        return page;
    }

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

    private void validateStateTransition(Integer currentState, Integer newState) {
        if (currentState.equals(newState)) {
            return;
        }
        
        // Validate state transitions
        if (currentState == AppConstants.STATUS_PENDING) {
            if (newState != AppConstants.STATUS_APPROVED && newState != AppConstants.STATUS_REJECTED) {
                throw new RuntimeException("Trạng thái không hợp lệ: Dự án đang chờ duyệt chỉ có thể chuyển sang trạng thái đã duyệt hoặc từ chối");
            }
        } else if (currentState == AppConstants.STATUS_APPROVED) {
            if (newState != AppConstants.STATUS_IN_PROGRESS) {
                throw new RuntimeException("Trạng thái không hợp lệ: Dự án đã duyệt chỉ có thể chuyển sang trạng thái đang thực hiện");
            }
        } else if (currentState == AppConstants.STATUS_IN_PROGRESS) {
            if (newState != AppConstants.STATUS_COMPLETE && newState != AppConstants.STATUS_OVERDUE) {
                throw new RuntimeException("Trạng thái không hợp lệ: Dự án đang thực hiện chỉ có thể chuyển sang trạng thái hoàn thành hoặc quá hạn");
            }
        } else if (currentState == AppConstants.STATUS_COMPLETE 
                || currentState == AppConstants.STATUS_OVERDUE 
                || currentState == AppConstants.STATUS_REJECTED) {
            throw new RuntimeException("Không thể thay đổi trạng thái của dự án đã kết thúc");
        }
    }

    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        BeanUtils.copyProperties(project, dto);
        
        // Calculate progress
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
        
        // Set display names
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

    /**
     * Kiểm tra xem departmentId có phải là phòng ban con (hoặc cháu, chắt) của parentId không
     */
    private boolean isSubDepartment(Long departmentId, Long parentId) {
        List<Department> subDepartments = getAllSubDepartments(parentId);
        return subDepartments.stream()
            .anyMatch(dept -> dept.getId().equals(departmentId));
    }
}
