package com.dev.truongdev.dto;

import lombok.Data;

@Data
public class CategoryDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long categoryTypeId;
    private String updateBy;
    
    // Additional fields for UI display
    private String categoryTypeName;
} 