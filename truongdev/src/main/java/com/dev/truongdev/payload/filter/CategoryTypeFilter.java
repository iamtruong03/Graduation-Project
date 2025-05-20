package com.dev.truongdev.payload.filter;

import com.dev.truongdev.xdevbase.dto.XDevBaseFilter;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Setter
@Getter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryTypeFilter extends XDevBaseFilter {
    // Thêm các trường filter đặc thù nếu cần
} 