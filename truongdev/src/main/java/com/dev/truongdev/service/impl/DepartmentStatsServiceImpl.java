package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.Department;
import com.dev.truongdev.entity.Project;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.repo.DepartmentRepo;
import com.dev.truongdev.repo.ProjectRepo;
import com.dev.truongdev.repo.TaskRepo;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.service.IDepartmentStatsService;
import com.dev.truongdev.utils.AppConstants;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DepartmentStatsServiceImpl implements IDepartmentStatsService {
    final DepartmentRepo departmentRepo;
    final UserRepo userRepo;
    final ProjectRepo projectRepo;
    final TaskRepo taskRepo;

    public DepartmentStatsServiceImpl(DepartmentRepo departmentRepo, UserRepo userRepo, 
            ProjectRepo projectRepo, TaskRepo taskRepo) {
        this.departmentRepo = departmentRepo;
        this.userRepo = userRepo;
        this.projectRepo = projectRepo;
        this.taskRepo = taskRepo;
    }

    @Override
    public Map<String, Object> getOverallStats(Long departmentId, String userId) {
        Map<String, Object> stats = new HashMap<>();
        
        // Lấy danh sách phòng ban
        List<Department> departments = getAllVisibleDepartments(departmentId, userId);
        
        // Thống kê tổng số phòng ban
        stats.put("totalDepartments", departments.size());
        
        // Thống kê tổng số nhân viên
        Long totalEmployees = userRepo.countByDepartmentIn(departments);
        stats.put("totalEmployees", totalEmployees);
        
        // Thống kê dự án
        List<Project> projects = projectRepo.findByDepartmentIn(departments);
        stats.put("totalProjects", projects.size());
        stats.put("activeProjects", projects.stream()
            .filter(p -> p.getState().equals(AppConstants.STATUS_IN_PROGRESS)).count());
        stats.put("completedProjects", projects.stream()
            .filter(p -> p.getState().equals(AppConstants.STATUS_COMPLETE)).count());
        
        return stats;
    }

    @Override
    public Map<String, Object> getDepartmentStats(Long departmentId, String userId) {
        Map<String, Object> stats = new HashMap<>();
        Department dept = departmentRepo.findById(departmentId)
            .orElseThrow(() -> new RuntimeException("Department not found"));

        // Thống kê nhân viên của phòng ban
        stats.put("employees", userRepo.countByDepartmentId(departmentId));

        // Thống kê dự án của phòng ban
        List<Project> projects = projectRepo.findByDepartmentId(departmentId);
        stats.put("activeProjects", projects.stream()
            .filter(p -> p.getState().equals(AppConstants.STATUS_IN_PROGRESS)).count());
        stats.put("completedProjects", projects.stream()
            .filter(p -> p.getState().equals(AppConstants.STATUS_COMPLETE)).count());

        // Tính toán hiệu suất phòng ban
        double performance = calculateDepartmentPerformance(departmentId);
        stats.put("performance", performance);

        // Lấy tiến độ dự án theo tháng
        List<Map<String, Object>> projectProgress = getProjectProgressByMonth(departmentId);
        stats.put("projectProgress", projectProgress);

        return stats;
    }

    @Override
    public List<Map<String, Object>> getEmployeeStats(Long departmentId, String userId) {
        List<Map<String, Object>> employeeStats = new ArrayList<>();
        List<User> employees = userRepo.findByDepartmentId(departmentId);

        for (User employee : employees) {
            Map<String, Object> stats = new HashMap<>();
            stats.put("id", employee.getId());
            stats.put("name", employee.getName());
            stats.put("role", employee.getRole());

            // Thống kê công việc
            List<Task> tasks = taskRepo.findByAssigneeId(employee.getId());
            stats.put("tasks", tasks.size());
            stats.put("completed", tasks.stream()
                .filter(t -> t.getState().equals(3)).count()); // 3 = Hoàn thành (từ StateNameUtils)

            employeeStats.add(stats);
        }

        return employeeStats;
    }

    @Override
    public Map<String, Object> getEmployeeDetails(Long employeeId, String userId) {
        Map<String, Object> details = new HashMap<>();
        User employee = userRepo.findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        details.put("id", employee.getId());
        details.put("name", employee.getName());
        details.put("role", employee.getRole());

        // Lấy dữ liệu hiệu suất theo tháng
        List<Map<String, Object>> performanceData = getEmployeePerformanceByMonth(employeeId);
        details.put("performanceData", performanceData);

        return details;
    }

    private List<Department> getAllVisibleDepartments(Long departmentId, String userId) {
        User user = userRepo.findById(Long.valueOf(userId))
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole().equals("ROLE_ADMIN") ||
            (departmentRepo.findById(departmentId).get().getParentId() == null)) {
            return departmentRepo.findAllByStatus(AppConstants.STATUS_ACTIVE);
        }

        Department department = departmentRepo.findById(departmentId)
            .orElseThrow(() -> new RuntimeException("Department not found"));

        List<Department> list = new ArrayList<>();
        list.add(department);
        list.addAll(getAllSubDepartments(departmentId));

        return list;
    }

    private List<Department> getAllSubDepartments(Long id) {
        List<Department> list = new ArrayList<>();
        List<Department> children = departmentRepo.findByParentIdAndStatus(id, AppConstants.STATUS_ACTIVE);
        list.addAll(children);

        for (Department dept : children) {
            list.addAll(getAllSubDepartments(dept.getId()));
        }
        return list;
    }

    private double calculateDepartmentPerformance(Long departmentId) {
        // Tính hiệu suất dựa trên tỷ lệ công việc hoàn thành đúng hạn
        List<Task> tasks = taskRepo.findByDepartmentId(departmentId);
        if (tasks.isEmpty()) {
            return 0.0;
        }
        
        long completedOnTime = tasks.stream()
            .filter(t -> t.getState().equals(3)) // 3 = Hoàn thành
            .filter(t -> t.getCompletedDate() != null && t.getDueDate() != null && 
                   !t.getCompletedDate().after(t.getDueDate()))
            .count();
        
        return (double) completedOnTime / tasks.size() * 100;
    }

    private List<Map<String, Object>> getProjectProgressByMonth(Long departmentId) {
        List<Map<String, Object>> progressData = new ArrayList<>();
        List<Project> projects = projectRepo.findByDepartmentId(departmentId);
        
        // Lấy dữ liệu 6 tháng gần nhất
        Calendar cal = Calendar.getInstance();
        for (int i = 5; i >= 0; i--) {
            cal.set(Calendar.MONTH, Calendar.getInstance().get(Calendar.MONTH) - i);
            int month = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month + "/" + year);
            
            // Đếm số dự án hoàn thành trong tháng
            final int currentMonth = month;
            final int currentYear = year;
            long completed = projects.stream()
                .filter(p -> p.getState().equals(AppConstants.STATUS_COMPLETE))
                .filter(p -> {
                    if (p.getEndDate() == null) return false;
                    Calendar projectCal = Calendar.getInstance();
                    projectCal.setTime(p.getEndDate());
                    return projectCal.get(Calendar.MONTH) + 1 == currentMonth && 
                           projectCal.get(Calendar.YEAR) == currentYear;
                })
                .count();
            
            monthData.put("completed", completed);
            progressData.add(monthData);
        }
        
        return progressData;
    }

    private List<Map<String, Object>> getEmployeePerformanceByMonth(Long employeeId) {
        List<Map<String, Object>> performanceData = new ArrayList<>();
        List<Task> tasks = taskRepo.findByAssigneeId(employeeId);
        
        // Lấy dữ liệu 6 tháng gần nhất
        Calendar cal = Calendar.getInstance();
        for (int i = 5; i >= 0; i--) {
            cal.set(Calendar.MONTH, Calendar.getInstance().get(Calendar.MONTH) - i);
            int month = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month + "/" + year);
            
            // Đếm số công việc hoàn thành trong tháng
            final int currentMonth = month;
            final int currentYear = year;
            long completed = tasks.stream()
                .filter(t -> t.getState().equals(3)) // 3 = Hoàn thành
                .filter(t -> {
                    if (t.getCompletedDate() == null) return false;
                    Calendar taskCal = Calendar.getInstance();
                    taskCal.setTime(t.getCompletedDate());
                    return taskCal.get(Calendar.MONTH) + 1 == currentMonth && 
                           taskCal.get(Calendar.YEAR) == currentYear;
                })
                .count();
            
            // Tính hiệu suất (tỷ lệ hoàn thành đúng hạn)
            long completedOnTime = tasks.stream()
                .filter(t -> t.getState().equals(3)) // 3 = Hoàn thành
                .filter(t -> {
                    if (t.getCompletedDate() == null || t.getDueDate() == null) return false;
                    Calendar taskCal = Calendar.getInstance();
                    taskCal.setTime(t.getCompletedDate());
                    return taskCal.get(Calendar.MONTH) + 1 == currentMonth && 
                           taskCal.get(Calendar.YEAR) == currentYear &&
                           !t.getCompletedDate().after(t.getDueDate());
                })
                .count();
            
            double performance = completed > 0 ? (double) completedOnTime / completed * 100 : 0;
            
            monthData.put("completed", completed);
            monthData.put("performance", performance);
            performanceData.add(monthData);
        }
        
        return performanceData;
    }
}
