package com.dev.truongdev.entity;

import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.Date;

@Entity
@Table(name = "messages")
@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message extends XDevBaseEntity {
    
    /**
     * ID người gửi tin nhắn
     */
    @Column(name = "sender_id", nullable = false)
    String senderId;
    
    /**
     * ID người nhận tin nhắn
     */
    @Column(name = "receiver_id", nullable = false)
    String receiverId;
    
    /**
     * Nội dung tin nhắn
     */
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    String content;
    
    /**
     * Thời gian gửi tin nhắn
     */
    @Column(name = "timestamp", nullable = false)
    Date timestamp;
    
    /**
     * Trạng thái đã đọc (true = đã đọc, false = chưa đọc)
     */
    @Column(name = "is_read", nullable = false)
    Boolean isRead;
    
    /**
     * Loại tin nhắn (TEXT, IMAGE, FILE, etc.)
     */
    @Column(name = "message_type")
    String messageType;
    
    /**
     * ID phòng ban (để kiểm soát quyền truy cập)
     */
    @Column(name = "department_id")
    Long departmentId;
}