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
public class ProjectHistory extends XDevBaseEntity {
    
    @Column(name = "project_id")
    Long projectId;
    
    @Column(name = "previous_state")
    Integer previousState;
    
    @Column(name = "new_state")
    Integer newState;
    
    @Column(name = "changed_by")
    String changedBy;
    
    @Column(name = "changed_at")
    Date changedAt;
    
    @Column(name = "comment")
    String comment;
} 