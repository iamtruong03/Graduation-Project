package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.Category;
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
import com.dev.truongdev.service.IDepartmentService;
import com.dev.truongdev.service.ICategoryService;
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
    IDepartmentService departmentService;
    ICategoryService categoryService;
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

    public ExcelExportServiceImpl(IProjectService projectService, 
                                IRiskService riskService, 
                                ITaskService taskService, 
                                IUserService userService,
                                UserRepo userRepo,
                                IDepartmentService departmentService,
                                ICategoryService categoryService) {
        this.projectService = projectService;
        this.riskService = riskService;
        this.taskService = taskService;
        this.userService = userService;
        this.userRepo = userRepo;
        this.departmentService = departmentService;
        this.categoryService = categoryService;
    }

    @Override
    public ByteArrayOutputStream exportProjects(Long departmentId, String uid, ProjectFilter filter) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Danh sách Dự án");
            
            // Tạo header row
            Row headerRow = sheet.createRow(0);
            String[] columns = {"STT", "Mã dự án", "Tên dự án", "Trạng thái", "Ngày bắt đầu", 
                              "Ngày kết thúc","Ngày hoàn thành" ,"Người quản lý", "Phòng ban", "Mô tả"};
            
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

                // Ngày hoàn thành
                Cell completedDateCell = row.createCell(6);
                if (project.getCompletedDate() != null) {
                    completedDateCell.setCellValue(dateFormat.format(project.getCompletedDate()));
                } else {
                    completedDateCell.setCellValue("");
                }
                
                // Người quản lý
                String managerName = "";
                if (project.getManagerId() != null) {
                    managerName = userService.getUserDisplayName(project.getManagerId());
                }
                row.createCell(7).setCellValue(managerName);
                
                // Phòng ban
                String departmentName = departmentService.getDepartmentNameById(project.getDepartmentId());
                row.createCell(8).setCellValue(departmentName);
                
                row.createCell(9).setCellValue(project.getDescription() != null ? project.getDescription() : "");
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
                              "Mức độ tác động", "Ngày phản ánh","Đơn vị ghi nhận", "Người phản ánh", "Dự án", "Mô tả", "Giải pháp"};
            
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
                
                // Loại rủi ro
                row.createCell(4).setCellValue(getRiskTypeName(risk.getRiskTypeId()));
                
                // Mức độ tác động
                row.createCell(5).setCellValue(getImpactLevelName(risk.getImpactLevelId()));
                
                // Ngày phản ánh
                Cell reflectionDateCell = row.createCell(6);
                if (risk.getReflectionDay() != null) {
                    reflectionDateCell.setCellValue(dateFormat.format(risk.getReflectionDay()));
                } else {
                    reflectionDateCell.setCellValue("");
                }
                
                // Đơn vị ghi nhận
                String departmentName = departmentService.getDepartmentNameById(risk.getDepartmentId());
                row.createCell(7).setCellValue(departmentName);
                
                // Người phản ánh
                String reflectorName = "";
                if (risk.getReflectorId() != null) {
                    reflectorName = userService.getUserDisplayName(risk.getReflectorId());
                }
                row.createCell(8).setCellValue(reflectorName);
                
                // Dự án
                String projectName = projectService.getProjectNameById(risk.getProjectId());
                row.createCell(9).setCellValue(projectName);
                
                // Mô tả
                row.createCell(10).setCellValue(risk.getDescription() != null ? risk.getDescription() : "");
                
                // Giải pháp
                row.createCell(11).setCellValue(risk.getRemedy() != null ? risk.getRemedy() : "");
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
            String[] columns = {"STT", "Mã công việc", "Tên công việc","Loại công việc","Phòng ban","Rủi ro", "Dự án", "Trạng thái", "Độ ưu tiên",
                              "Ngày bắt đầu", "Ngày kết thúc", "Ngày hoàn thành", "Người được giao", "Mô tả"};
            
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
                
                // Loại công việc
                row.createCell(3).setCellValue(getTaskTypeName(task.getTaskTypeId()));
                
                // Phòng ban
                String departmentName = departmentService.getDepartmentNameById(task.getDepartmentId());
                row.createCell(4).setCellValue(departmentName);
                
                // Rủi ro
                String riskName = riskService.getRiskNameById(task.getRiskId());
                row.createCell(5).setCellValue(riskName);
                
                // Dự án
                String projectName = projectService.getProjectNameById(task.getProjectId());
                row.createCell(6).setCellValue(projectName);
                
                // Trạng thái
                row.createCell(7).setCellValue(StateNameUtils.getTaskStateName(task.getState()));
                
                // Độ ưu tiên
                row.createCell(8).setCellValue(getPriorityName(task.getPriorityId()));
                
                // Ngày bắt đầu
                Cell startDateCell = row.createCell(9);
                if (task.getStartDate() != null) {
                    startDateCell.setCellValue(dateFormat.format(task.getStartDate()));
                } else {
                    startDateCell.setCellValue("");
                }
                
                // Ngày kết thúc
                Cell dueDateCell = row.createCell(10);
                if (task.getDueDate() != null) {
                    dueDateCell.setCellValue(dateFormat.format(task.getDueDate()));
                } else {
                    dueDateCell.setCellValue("");
                }
                
                // Ngày hoàn thành
                Cell completedDateCell = row.createCell(11);
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
                row.createCell(12).setCellValue(assigneeName);
                
                // Mô tả
                row.createCell(13).setCellValue(task.getDescription() != null ? task.getDescription() : "");
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

    private String getPriorityName(Integer priorityId) {
        if (priorityId == null) {
            return "";
        }
        return switch (priorityId) {
            case 3 -> "Cao";
            case 2 -> "Trung bình";
            case 1 -> "Thấp";
            default -> "";
        };
    }

    private String getTaskTypeName(Integer taskTypeId) {
        if (taskTypeId == null) {
            return "";
        }
        return switch (taskTypeId) {
            case 1 -> "Công việc rủi ro";
            case 2 -> "Công việc dự án";
            case 3 -> "Công việc phòng ban";
            default -> "";
        };
    }

    private String getRiskTypeName(Long riskTypeId) {
        if (riskTypeId == null) {
            return "";
        }
        return categoryService.getByCategoryType(null, "riskTypeId").stream()
            .filter(category -> category.getId().equals(riskTypeId))
            .findFirst()
            .map(Category::getName)
            .orElse("");
    }

    private String getImpactLevelName(Integer impactLevelId) {
        if (impactLevelId == null) {
            return "";
        }
        return categoryService.getByCategoryType(null, "impactLevelId").stream()
            .filter(category -> category.getId().equals(impactLevelId.longValue()))
            .findFirst()
            .map(Category::getName)
            .orElse("");
    }
} 