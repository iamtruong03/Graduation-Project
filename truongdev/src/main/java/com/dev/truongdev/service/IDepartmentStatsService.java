package com.dev.truongdev.service;

import java.util.List;
import java.util.Map;

public interface IDepartmentStatsService {
    Map<String, Object> getOverallStats(Long departmentId, String userId);
    Map<String, Object> getDepartmentStats(Long departmentId, String userId);
    List<Map<String, Object>> getEmployeeStats(Long departmentId, String userId);
    Map<String, Object> getEmployeeDetails(Long employeeId, String userId);
}