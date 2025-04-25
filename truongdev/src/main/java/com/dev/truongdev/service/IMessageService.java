package com.dev.truongdev.service;

import com.dev.truongdev.entity.Message;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;

public interface IMessageService extends IXDevBaseService<Message> {
    Message sendMessage(String uid, Long senderId, Long receiverId, String content);
    
    List<Message> getMessagesBetweenUsers(String uid, Long currentUserId, Long userId);
    
    List<Message> getUnreadMessages(String uid, Long currentUserId);
    
    void markMessageAsRead(String uid, Long messageId);
    
    List<Long> getRecentChatUsers(String uid, Long userId);
}