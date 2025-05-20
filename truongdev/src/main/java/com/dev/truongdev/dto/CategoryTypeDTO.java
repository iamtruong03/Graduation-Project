package com.dev.truongdev.dto;

import lombok.Data;

@Data
public class CategoryTypeDTO {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Integer status;
    private String updateBy;
} 