package com.dev.truongdev.service;

import com.dev.truongdev.entity.Message;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import java.util.List;

public interface IMessageService extends IXDevBaseService<Message> {
    Message sendMessage(Long cid, String uid, Long senderId, Long receiverId, String content);
    
    List<Message> getMessagesBetweenUsers(Long cid, String uid, Long currentUserId, Long userId);
    
    List<Message> getUnreadMessages(Long cid, String uid, Long currentUserId);
    
    void markMessageAsRead(Long cid, String uid, Long messageId);
    
    List<Long> getRecentChatUsers(Long cid, String uid, Long userId);
}