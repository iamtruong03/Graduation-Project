package com.dev.truongdev.service;

import com.dev.truongdev.entity.Project;
import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.payload.filter.TaskFilter;
import org.springframework.data.domain.Pageable;

import java.io.ByteArrayOutputStream;
import java.util.List;

/**
 * Service interface cho việc export dữ liệu ra Excel.
 */
public interface IExcelExportService {
    
    /**
     * Export danh sách dự án ra Excel.
     * @param departmentId ID phòng ban
     * @param uid ID người dùng yêu cầu
     * @param filter Bộ lọc tìm kiếm
     * @return ByteArrayOutputStream chứa file Excel
     */
    ByteArrayOutputStream exportProjects(Long departmentId, String uid, ProjectFilter filter);
    
    /**
     * Export danh sách rủi ro ra Excel.
     * @param departmentId ID phòng ban
     * @param uid ID người dùng yêu cầu
     * @param filter Bộ lọc tìm kiếm
     * @return ByteArrayOutputStream chứa file Excel
     */
    ByteArrayOutputStream exportRisks(Long departmentId, String uid, RiskFilter filter);
    
    /**
     * Export danh sách công việc ra Excel.
     * @param departmentId ID phòng ban
     * @param uid ID người dùng yêu cầu
     * @param filter Bộ lọc tìm kiếm
     * @return ByteArrayOutputStream chứa file Excel
     */
    ByteArrayOutputStream exportTasks(Long departmentId, String uid, TaskFilter filter);
} 