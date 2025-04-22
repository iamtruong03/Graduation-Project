package com.dev.truongdev.xdevbase.entity;

import com.dev.truongdev.utils.BusinessException;
import com.dev.truongdev.utils.Constants;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.lang.reflect.Field;
import java.util.Date;
import java.util.Objects;
import lombok.*;
import lombok.experimental.SuperBuilder;
import lombok.experimental.FieldNameConstants;
import lombok.experimental.FieldDefaults;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;

@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@FieldNameConstants
@MappedSuperclass
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class XDevBaseEntity {
  @Id
  @GenericGenerator(name = "id")
  @GeneratedValue(generator = "id")
  @Column(name = "id")
  Long id;

  @Column(name = "code", length = 30)
  String code;

  @Column(name = "name", length = 500)
  String name;

  @Column(name = "description", columnDefinition = "text")
  String description;

  @Column(name = "status", nullable = false)
  Integer status;

  // Nguoi phu trach
  @Column(name = "responsible_id")
  String responsibleId;

  @Column(name = "process_instance_id")
  Long processInstanceId;

  @Column(name = "state")
  Integer state;

  @Temporal(TemporalType.TIMESTAMP)
  @JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd'T'HH:mm:ssZ", timezone="Asia/Ho_Chi_Minh")
  Date createDate;

  @Temporal(TemporalType.TIMESTAMP)
  @JsonFormat(shape= JsonFormat.Shape.STRING, pattern="yyyy-MM-dd'T'HH:mm:ssZ", timezone="Asia/Ho_Chi_Minh")
  Date modifiedDate;

  @Version
  Long version;

  

  @CreatedBy
  String createBy;

  @LastModifiedBy
  String updateBy;

  @Transient
  @Builder.Default
  private boolean isNew = true;

  @JsonIgnore
  public boolean isNew() {
    return isNew;
  }

  @PrePersist
  void setInitialDate() {
    createDate = modifiedDate = new Date();
    if(createBy==null){
      createBy= Constants.SYSTEM;
    }
    if(updateBy==null){
      updateBy=Constants.SYSTEM;
    }
    if(status==null){
      status= Constants.ENTITY_ACTIVE;
    }
  }

  @PreUpdate
  void updateDate() {
    modifiedDate = new Date();
  }

  public <E extends XDevBaseEntity> boolean equals(E other) throws BusinessException {
    if (other == null) return false;

    try {
      Class<?> clazz = this.getClass();
      while (clazz != null && clazz != Object.class) {
        for (Field field : clazz.getDeclaredFields()) {
          field.setAccessible(true);
          Object thisValue = field.get(this);
          Object otherValue = field.get(other);

          if (!Objects.equals(thisValue, otherValue)) {
            return false;
          }
        }
        clazz = clazz.getSuperclass();
      }
    } catch (IllegalAccessException e) {
      throw new BusinessException("Error comparing fields: " + e.getMessage(), e);
    }

    return true;
  }
}
