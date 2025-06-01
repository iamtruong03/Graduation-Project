package com.dev.truongdev.service.impl;

import com.dev.truongdev.dto.dashload.department.DepartmentStatsDTO;
import com.dev.truongdev.dto.dashload.department.ProjectProgressDTO;
import com.dev.truongdev.dto.dashload.department.UserPerformanceDataDTO;
import com.dev.truongdev.dto.dashload.department.UserStatsDTO;
import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.payload.filter.DepartmentFilter;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.repo.TaskRepo;
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentServiceImpl extends
    XDevBaseServiceImpl<Department,DepartmentFilter, DepartmentRepo> implements
    IDepartmentService<Department, DepartmentFilter> {

  final DepartmentRepo departmentRepo;
  final UserRepo userRepo;
  final ProjectRepo projectRepo;
  final TaskRepo taskRepo;
  final IUserService userService; // Thay đổi kiểu từ UserServiceImpl sang interface

  public DepartmentServiceImpl(DepartmentRepo repo, UserRepo userRepo, 
                             ProjectRepo projectRepo, TaskRepo taskRepo,
                             @Lazy IUserService userService) { // Thêm @Lazy
    super(repo);
    this.departmentRepo = repo;
    this.userRepo = userRepo;
    this.projectRepo = projectRepo;
    this.taskRepo = taskRepo;
    this.userService = userService;
  }

  @Override
  public void delete(String uid, Long id) {
    // Kiểm tra phòng ban có dự án đang thực hiện không
    boolean hasActiveProjects = projectRepo.existsByDepartmentIdAndState(
        id,
        AppConstants.STATUS_IN_PROGRESS
    );
    if (hasActiveProjects) {
      throw new RuntimeException("Không thể xóa phòng ban đang có dự án đang thực hiện");
    }

    // Kiểm tra phòng ban có task đang thực hiện không
    boolean hasActiveTasks = taskRepo.existsByDepartmentIdAndStateAndStatus(
        id,
        AppConstants.STATUS_IN_PROGRESS,
        1
    );
    if (hasActiveTasks) {
      throw new RuntimeException("Không thể xóa phòng ban đang có task đang thực hiện");
    }

    // Kiểm tra các phòng ban con
    List<Department> subDepartments = getAllSubDepartments(id);
    for (Department subDept : subDepartments) {
      hasActiveProjects = projectRepo.existsByDepartmentIdAndState(
          subDept.getId(),
          AppConstants.STATUS_IN_PROGRESS
      );
      if (hasActiveProjects) {
        throw new RuntimeException("Không thể xóa phòng ban có phòng ban con đang có dự án đang thực hiện");
      }

      hasActiveTasks = taskRepo.existsByDepartmentIdAndStateAndStatus(
          subDept.getId(),
          AppConstants.STATUS_IN_PROGRESS,
          1
      );
      if (hasActiveTasks) {
        throw new RuntimeException("Không thể xóa phòng ban có phòng ban con đang có task đang thực hiện");
      }
    }

    // Nếu không có ràng buộc thì thực hiện xóa
    super.delete(uid, id);
  }

  // lấy phòng ban con, cháu, chắt
  @Override
  public List<Department> getAllSubDepartments(Long id) {
    List<Department> list = new ArrayList<>();
    Queue<Long> queue = new LinkedList<>();
    queue.add(id);

    while (!queue.isEmpty()) {
      Long currentId = queue.poll();
      List<Department> children = departmentRepo.findByParentIdAndStatus(currentId, AppConstants.STATUS_ACTIVE);
      list.addAll(children);

      for (Department dept : children) {
        queue.add(dept.getId());
      }
    }
    return list;
  }

  // lấy phòng ban hiện tại + con cháu...
  @Override
  public List<Department> getAll(Long did, String uid) {
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Kiểm tra điều kiện xem toàn hệ thống (admin hoặc phòng ban root)
    if (user.getRole().equals("1") ||
        (departmentRepo.findById(did).get().getParentId() == null)) {
      return departmentRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
    }

    Department department = departmentRepo.findById(did)
        .orElseThrow(() -> new RuntimeException("Department not found"));

    List<Department> list = new ArrayList<>();
    list.add(department);
    list.addAll(getAllSubDepartments(did));

    return list;
  }

  // Lấy danh sách phòng ban đang hoạt động với thông tin cơ bản
  @Override
  public List<Department> getActiveDepartments(String uid) {
    return departmentRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
  }

  // lấy phòng ban hiện tại + con cháu...
  @Override
  public Page<Department> searchAll(Long did, String uid, DepartmentFilter filter, Pageable pageable) {
    User user = userRepo.findById(Long.valueOf(uid))
        .orElseThrow(() -> new RuntimeException("User not found"));

    Page<Department> page;

    // Kiểm tra điều kiện xem toàn hệ thống (admin hoặc phòng ban root)
    if (user.getRole().equals("1") ||
        (departmentRepo.findById(did).get().getParentId() == null)) {
        List<Department> allDepartments = departmentRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);

        page = departmentRepo.searchByCodeOrName(AppConstants.STATUS_ACTIVE,  filter.getSearch(), allDepartments, pageable);

    } else {
      Department department = departmentRepo.findById(did)
          .orElseThrow(() -> new RuntimeException("Department not found"));

      List<Department> list = new ArrayList<>();
      list.add(department);
      list.addAll(getAllSubDepartments(did));

      page = departmentRepo.searchByCodeOrName(AppConstants.STATUS_ACTIVE, filter.getSearch(), list, pageable);
    }

    return page;
  }

  @Override
  public String getDepartmentNameById(Long id) {
    if (id == null) {
      return "";
    }
    return departmentRepo.findById(id)
        .map(Department::getName)
        .orElse("");
  }

  @Override
  public DepartmentStatsDTO getDepartmentStats(String uid, Long did ,Long departmentId){
    DepartmentStatsDTO departmentStatsDTO = new DepartmentStatsDTO();

    if (departmentId == null) {
      List<Department> accessibleDepartments = getAll(did, uid);
      List<Long> departmentIds = accessibleDepartments.stream()
          .map(Department::getId)
          .collect(Collectors.toList());

      // phong ban
      departmentStatsDTO.setTotalDepartments((long) departmentIds.size());
      departmentStatsDTO.setTotalUsers(userRepo.countByDepartmentIdIn(departmentIds));
      departmentStatsDTO.setTotalProjects(projectRepo.countByDepartmentIdIn(departmentIds));
      departmentStatsDTO.setTotalProjectsProcess(projectRepo.countByDepartmentIdInAndState(departmentIds, AppConstants.STATUS_IN_PROGRESS));
      departmentStatsDTO.setTotalProjectsComplete(projectRepo.countByDepartmentIdInAndState(departmentIds, AppConstants.STATUS_COMPLETE));

      // Thống kê tiến độ theo tháng
      List<ProjectProgressDTO> progressList = new ArrayList<>();

      for (int month = 1; month <= 12; month++) {
        String label = "T" + month;

        LocalDate startLocal = LocalDate.of(2025, month, 1);
        LocalDate endLocal = startLocal.withDayOfMonth(startLocal.lengthOfMonth());

        Date startDate = java.sql.Date.valueOf(startLocal);
        Date endDate = java.sql.Date.valueOf(endLocal);

        Integer count = projectRepo.countByDepartmentIdInAndStatusAndStartDateBetween(
            departmentIds, AppConstants.STATUS_ACTIVE, startDate, endDate
        );

        progressList.add(new ProjectProgressDTO(label, count));
      }

      departmentStatsDTO.setMonthlyProgress(progressList);

      // user
      List<User> users = userRepo.findByDepartmentIdInAndStatus(departmentIds, 1);
      List<UserStatsDTO> userStatsList = new ArrayList<>();

      for (User u : users) {
        Long userId = u.getId();

        String name = userService.getUserDisplayName(String.valueOf(userId));
        String position = AppConstants.getPositionName(u.getPositionId());

        Long completedTasks = taskRepo.countByAssigneeIdAndStatusAndState(String.valueOf(userId), 1, AppConstants.STATUS_COMPLETE);
        Long totalTasks = taskRepo.countByAssigneeIdAndStatus(String.valueOf(userId), 1);

        double efficiency = (totalTasks != 0) ? (completedTasks * 100.0 / totalTasks) : 0.0;

        List<UserPerformanceDataDTO> performanceData = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
          String label = "T" + month;

          LocalDate startLocal = LocalDate.of(2025, month, 1);
          LocalDate endLocal = startLocal.withDayOfMonth(startLocal.lengthOfMonth());

          Date startDate = java.sql.Date.valueOf(startLocal);
          Date endDate = java.sql.Date.valueOf(endLocal);

          Long countCompleted = taskRepo.countByAssigneeIdAndStatusAndStateAndStartDateBetween(
              String.valueOf(userId), AppConstants.STATUS_ACTIVE, AppConstants.STATUS_COMPLETE, startDate, endDate
          );

          Long total = taskRepo.countByAssigneeIdAndStatusAndStartDateBetween(
              String.valueOf(userId), AppConstants.STATUS_ACTIVE, startDate, endDate
          );


          performanceData.add(new UserPerformanceDataDTO(label, countCompleted, total));
        }

        userStatsList.add(new UserStatsDTO(name, position, efficiency, completedTasks, totalTasks, performanceData));
      }

      departmentStatsDTO.setUserStatsList(userStatsList);


    } else {
      departmentStatsDTO.setTotalDepartments(1L);
      departmentStatsDTO.setTotalUsers(userRepo.countByDepartmentId(departmentId));
      departmentStatsDTO.setTotalProjects(projectRepo.countByDepartmentId(departmentId));
      departmentStatsDTO.setTotalProjectsProcess(projectRepo.countByDepartmentIdAndState(departmentId, AppConstants.STATUS_IN_PROGRESS));
      departmentStatsDTO.setTotalProjectsComplete(projectRepo.countByDepartmentIdAndState(departmentId, AppConstants.STATUS_COMPLETE));

      // Thống kê tiến độ theo tháng
      List<ProjectProgressDTO> progressList = new ArrayList<>();

      for (int month = 1; month <= 12; month++) {
        String label = "T" + month;

        LocalDate startLocal = LocalDate.of(2025, month, 1);
        LocalDate endLocal = startLocal.withDayOfMonth(startLocal.lengthOfMonth());

        Date startDate = java.sql.Date.valueOf(startLocal);
        Date endDate = java.sql.Date.valueOf(endLocal);

        Integer count = projectRepo.countByDepartmentIdAndStatusAndStartDateBetween(
            departmentId, AppConstants.STATUS_ACTIVE, startDate, endDate
        );

        progressList.add(new ProjectProgressDTO(label, count));
      }

      departmentStatsDTO.setMonthlyProgress(progressList);

      // user
      List<User> users = userRepo.findByDepartmentIdAndStatus(departmentId, 1);
      List<UserStatsDTO> userStatsList = new ArrayList<>();

      for (User u : users) {
        Long userId = u.getId();

        String name = userService.getUserDisplayName(String.valueOf(userId));
        String position = AppConstants.getPositionName(u.getPositionId());

        Long completedTasks = taskRepo.countByAssigneeIdAndStatusAndState(String.valueOf(userId), 1, AppConstants.STATUS_COMPLETE);
        Long totalTasks = taskRepo.countByAssigneeIdAndStatus(String.valueOf(userId), 1);

        double efficiency = (totalTasks != 0) ? (completedTasks * 100.0 / totalTasks) : 0.0;

        List<UserPerformanceDataDTO> performanceData = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
          String label = "T" + month;

          LocalDate startLocal = LocalDate.of(2025, month, 1);
          LocalDate endLocal = startLocal.withDayOfMonth(startLocal.lengthOfMonth());

          Date startDate = java.sql.Date.valueOf(startLocal);
          Date endDate = java.sql.Date.valueOf(endLocal);

          Long countCompleted = taskRepo.countByAssigneeIdAndStatusAndStateAndStartDateBetween(
              String.valueOf(userId), AppConstants.STATUS_ACTIVE, AppConstants.STATUS_COMPLETE, startDate, endDate
          );

          Long total = taskRepo.countByAssigneeIdAndStatusAndStartDateBetween(
              String.valueOf(userId), AppConstants.STATUS_ACTIVE, startDate, endDate
          );


          performanceData.add(new UserPerformanceDataDTO(label, countCompleted, total));
        }

        userStatsList.add(new UserStatsDTO(name, position, efficiency, completedTasks, totalTasks, performanceData));
      }

      departmentStatsDTO.setUserStatsList(userStatsList);

    }

    return departmentStatsDTO;
  }

}
