package com.dev.truongdev.dto;

import lombok.Data;
import java.util.Date;

@Data
public class MessageDTO {
    private Long id;
    private String senderId;
    private String receiverId;
    private String content;
    private Date timestamp;
    private Boolean isRead;
    private String messageType;
    private Long departmentId;
    
    // Display fields for UI
    private String senderName;
    private String receiverName;
    private String timeAgo; // "5 phút trước", "1 giờ trước"
    
    // For WebSocket messaging
    private String action; // "SEND", "READ", "TYPING", "ONLINE", "OFFLINE"
    private String chatRoomId; // Unique room ID for 1-on-1 chat
} 