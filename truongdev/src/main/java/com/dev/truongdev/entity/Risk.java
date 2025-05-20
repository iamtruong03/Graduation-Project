package com.dev.truongdev.entity;

import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.util.Date;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Risk extends XDevBaseEntity {
    // Trạng thái rủi ro (0: Identified, 1: Analyzing, 2: Monitored, 3: Resolved, 4: Closed)
    @Column(name = "state")
    Integer state;

    // Loại rủi ro
    @Column(name = "risk_type_id")
    Long riskTypeId;

    // Dự án liên quan
    @Column(name = "project_id")
    Long projectId;

    // Mức độ ảnh hưởng (1: Low, 2: Medium, 3: High, 4: Critical)
    @Column(name = "impact_level_id")
    Integer impactLevelId;

    // phạm vi ảnh hưởng
    Integer scopeId;

    // Người phản ánh
    String reflectorId;

    // Ngày phan anh
    Date reflectionDay;

}
