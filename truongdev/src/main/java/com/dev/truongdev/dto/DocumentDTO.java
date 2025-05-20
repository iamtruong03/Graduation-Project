package com.dev.truongdev.dto;

import lombok.Data;

@Data
public class DocumentDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String filePath;
    private Long documentTypeId;
    private Long departmentId;
    private Long projectId;
    private String updateBy;
    
    // Additional fields for UI display
    private String documentTypeName;
    private String departmentName;
    private String projectName;
} 