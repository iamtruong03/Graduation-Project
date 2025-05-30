package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.Project;
import com.dev.truongdev.entity.Risk;
import com.dev.truongdev.entity.Task;
import com.dev.truongdev.payload.filter.ProjectFilter;
import com.dev.truongdev.payload.filter.RiskFilter;
import com.dev.truongdev.payload.filter.TaskFilter;
import com.dev.truongdev.repo.UserRepo;
import com.dev.truongdev.service.IExcelExportService;
import com.dev.truongdev.service.IProjectService;
import com.dev.truongdev.service.IRiskService;
import com.dev.truongdev.service.ITaskService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.StateNameUtils;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.List;

/**
 * Service implementation cho việc export dữ liệu ra Excel.
 * Sử dụng Apache POI để tạo file Excel với format chuẩn.
 */
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExcelExportServiceImpl implements IExcelExportService {

    IProjectService projectService;
    IRiskService riskService;
    ITaskService taskService;
    IUserService userService;
    UserRepo userRepo;
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

    public ExcelExportServiceImpl(IProjectService projectService, 
                                IRiskService riskService, 
                                ITaskService taskService, 
                                IUserService userService,
                                UserRepo userRepo) {
        this.projectService = projectService;
        this.riskService = riskService;
        this.taskService = taskService;
        this.userService = userService;
        this.userRepo = userRepo;
    }

    /**
     * Export danh sách dự án ra Excel với đầy đủ thông tin.
     * Bao gồm: Mã, Tên, Trạng thái, Ngày bắt đầu/kết thúc, Tiến độ, Người quản lý.
     */
    @Override
    public ByteArrayOutputStream exportProjects(Long departmentId, String uid, ProjectFilter filter) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách Dự án");
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"STT", "Mã dự án", "Tên dự án", "Trạng thái", "Ngày bắt đầu", 
                              "Ngày kết thúc", "Người quản lý", "Phòng ban", "Mô tả"};
            
            CellStyle headerStyle = getHeaderCellStyle(workbook);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Lấy dữ liệu
            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
            Page<Project> projectPage = projectService.searchAll(departmentId, uid, filter, pageable);
            List<Project> projects = projectPage.getContent();
            
            // Điền dữ liệu
            int rowNum = 1;
            for (Project project : projects) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(rowNum - 1);
                row.createCell(1).setCellValue(project.getCode() != null ? project.getCode() : "");
                row.createCell(2).setCellValue(project.getName() != null ? project.getName() : "");
                row.createCell(3).setCellValue(StateNameUtils.getProjectStateName(project.getState()));
                
                // Ngày bắt đầu
                Cell startDateCell = row.createCell(4);
                if (project.getStartDate() != null) {
                    startDateCell.setCellValue(dateFormat.format(project.getStartDate()));
                } else {
                    startDateCell.setCellValue("");
                }
                
                // Ngày kết thúc
                Cell endDateCell = row.createCell(5);
                if (project.getEndDate() != null) {
                    endDateCell.setCellValue(dateFormat.format(project.getEndDate()));
                } else {
                    endDateCell.setCellValue("");
                }
                
                // Người quản lý
                String managerName = "";
                if (project.getManagerId() != null) {
                    managerName = userService.getUserDisplayName(project.getManagerId());
                }
                row.createCell(6).setCellValue(managerName);
                
                row.createCell(7).setCellValue(""); // Department name
                row.createCell(8).setCellValue(project.getDescription() != null ? project.getDescription() : "");
            }
            
            // Auto size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream;
            
        } catch (IOException e) {
            throw new RuntimeException("Error creating Excel file for projects", e);
        }
    }

    /**
     * Export danh sách rủi ro ra Excel với đầy đủ thông tin.
     * Bao gồm: Mã, Tên, Trạng thái, Mức độ tác động, Ngày phản ánh, Người phản ánh.
     */
    @Override
    public ByteArrayOutputStream exportRisks(Long departmentId, String uid, RiskFilter filter) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách Rủi ro");
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"STT", "Mã rủi ro", "Tên rủi ro", "Trạng thái", "Loại rủi ro", 
                              "Mức độ tác động", "Ngày phản ánh", "Người phản ánh", "Dự án", "Mô tả"};
            
            CellStyle headerStyle = getHeaderCellStyle(workbook);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Lấy dữ liệu
            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
            Page<Risk> riskPage = riskService.searchAll(departmentId, uid, filter, pageable);
            List<Risk> risks = riskPage.getContent();
            
            // Điền dữ liệu
            int rowNum = 1;
            for (Risk risk : risks) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(rowNum - 1);
                row.createCell(1).setCellValue(risk.getCode() != null ? risk.getCode() : "");
                row.createCell(2).setCellValue(risk.getName() != null ? risk.getName() : "");
                row.createCell(3).setCellValue(StateNameUtils.getRiskStateName(risk.getState()));
                row.createCell(4).setCellValue(""); // Risk type
                row.createCell(5).setCellValue(""); // Impact level
                
                // Ngày phản ánh
                Cell reflectionDateCell = row.createCell(6);
                if (risk.getReflectionDay() != null) {
                    reflectionDateCell.setCellValue(dateFormat.format(risk.getReflectionDay()));
                } else {
                    reflectionDateCell.setCellValue("");
                }
                
                // Người phản ánh
                String reflectorName = "";
                if (risk.getReflectorId() != null) {
                    reflectorName = userService.getUserDisplayName(risk.getReflectorId());
                }
                row.createCell(7).setCellValue(reflectorName);
                
                row.createCell(8).setCellValue(""); // Project name
                row.createCell(9).setCellValue(risk.getDescription() != null ? risk.getDescription() : "");
            }
            
            // Auto size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream;
            
        } catch (IOException e) {
            throw new RuntimeException("Error creating Excel file for risks", e);
        }
    }

    /**
     * Export danh sách công việc ra Excel với đầy đủ thông tin.
     * Bao gồm: Mã, Tên, Trạng thái, Độ ưu tiên, Ngày bắt đầu/hết hạn, Người được giao.
     */
    @Override
    public ByteArrayOutputStream exportTasks(Long departmentId, String uid, TaskFilter filter) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách Công việc");
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"STT", "Mã công việc", "Tên công việc", "Trạng thái", "Độ ưu tiên", 
                              "Ngày bắt đầu", "Ngày hết hạn", "Ngày hoàn thành", "Người được giao", "Dự án"};
            
            CellStyle headerStyle = getHeaderCellStyle(workbook);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Lấy dữ liệu
            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
            Page<Task> taskPage = taskService.searchAll(departmentId, uid, filter, pageable);
            List<Task> tasks = taskPage.getContent();
            
            // Điền dữ liệu
            int rowNum = 1;
            for (Task task : tasks) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(rowNum - 1);
                row.createCell(1).setCellValue(task.getCode() != null ? task.getCode() : "");
                row.createCell(2).setCellValue(task.getName() != null ? task.getName() : "");
                row.createCell(3).setCellValue(StateNameUtils.getTaskStateName(task.getState()));
                row.createCell(4).setCellValue(""); // Priority
                
                // Ngày bắt đầu
                Cell startDateCell = row.createCell(5);
                if (task.getStartDate() != null) {
                    startDateCell.setCellValue(dateFormat.format(task.getStartDate()));
                } else {
                    startDateCell.setCellValue("");
                }
                
                // Ngày hết hạn
                Cell dueDateCell = row.createCell(6);
                if (task.getDueDate() != null) {
                    dueDateCell.setCellValue(dateFormat.format(task.getDueDate()));
                } else {
                    dueDateCell.setCellValue("");
                }
                
                // Ngày hoàn thành
                Cell completedDateCell = row.createCell(7);
                if (task.getCompletedDate() != null) {
                    completedDateCell.setCellValue(dateFormat.format(task.getCompletedDate()));
                } else {
                    completedDateCell.setCellValue("");
                }
                
                // Người được giao
                String assigneeName = "";
                if (task.getAssigneeId() != null) {
                    assigneeName = userService.getUserDisplayName(task.getAssigneeId());
                }
                row.createCell(8).setCellValue(assigneeName);
                
                row.createCell(9).setCellValue(""); // Project name
            }
            
            // Auto size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream;
            
        } catch (IOException e) {
            throw new RuntimeException("Error creating Excel file for tasks", e);
        }
    }

    private CellStyle getHeaderCellStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
} 