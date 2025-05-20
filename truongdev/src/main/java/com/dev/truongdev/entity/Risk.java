package com.dev.truongdev.entity;

import com.dev.truongdev.utils.StringListConverter;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import java.util.Date;
import java.util.List;
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

    // Khả năng xảy ra (1: Unlikely, 2: Possible, 3: Likely, 4: Almost Certain)
    @Column(name = "probability_id")
    Integer probabilityId;

    // Mức độ ưu tiên (Tự động tính dựa trên impact và probability)
    @Column(name = "priority_id")
    Integer priorityId;

    // Ngày p
    @Column(name = "identified_date")
    Date reflectionDay;

    // Hạn xử lý
    @Column(name = "due_date")
    Date dueDate;

    // Ngày đóng rủi ro
    @Column(name = "closed_date")
    Date closedDate;

    // Người quản lý rủi ro
    @Column(name = "manager_id")
    String managerId;

    // Người phụ trách xử lý
    @Column(name = "responsible_id")
    String responsibleId;

    // Danh sách người theo dõi
    @Column(name = "follower_ids", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    List<String> followerIds;

    // Chiến lược xử lý (1: Avoid, 2: Transfer, 3: Mitigate, 4: Accept)
    @Column(name = "mitigation_strategy")
    Integer mitigationStrategy;

    // Chi phí dự phòng
    @Column(name = "contingency_cost")
    Double contingencyCost;

    // Kế hoạch dự phòng
    @Column(name = "contingency_plan", columnDefinition = "TEXT")
    String contingencyPlan;

    // Các hành động giảm thiểu
    @Column(name = "mitigation_actions", columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    List<String> mitigationActions;
}
