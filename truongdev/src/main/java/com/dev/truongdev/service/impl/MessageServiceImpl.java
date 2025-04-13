package com.dev.truongdev.service.impl;

import com.dev.truongdev.entity.Message;
import com.dev.truongdev.repo.MessageRepo;
import com.dev.truongdev.service.IMessageService;
import com.dev.truongdev.xdevbase.service.impl.XDevBaseServiceImpl;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageServiceImpl
    extends XDevBaseServiceImpl<Message, MessageRepo>
    implements IMessageService {

    final MessageRepo repo;

    public MessageServiceImpl(MessageRepo repo) {
        super(repo);
        this.repo = repo;
    }

    @Override
    @Transactional
    public Message sendMessage(Long cid, String uid, Long senderId, Long receiverId, String content) {
        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .content(content)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();
        return create(cid, uid, message);
    }

    @Override
    public List<Message> getMessagesBetweenUsers(Long cid, String uid, Long currentUserId, Long userId) {
        return repo.findMessagesBetweenUsers(currentUserId, userId);
    }

    @Override
    public List<Message> getUnreadMessages(Long cid, String uid, Long currentUserId) {
        return repo.findByReceiverIdAndIsReadFalseOrderByTimestampDesc(currentUserId);
    }

    @Override
    @Transactional
    public void markMessageAsRead(Long cid, String uid, Long messageId) {
        Message message = getById(cid, uid, messageId);
        message.setRead(true);
        update(cid, uid, message, messageId);
    }

    @Override
    public List<Long> getRecentChatUsers(Long cid, String uid, Long userId) {
        return repo.findRecentChatUsers(userId);
    }
}