package com.dev.truongdev.api;

import com.dev.truongdev.entity.Message;
import com.dev.truongdev.entity.User;
import com.dev.truongdev.service.IMessageService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageAPI extends XDevBaseAPI<Message> {

    final IMessageService messageService;
    final IUserService userService;
    final SimpMessagingTemplate messagingTemplate;

    @Override
    public IXDevBaseService<Message> getService() {
        return messageService;
    }

    @MessageMapping("/chat")
    public void processMessage(
            @RequestHeader("cid") Long cid,
            @RequestHeader("uid") String uid,
            @Payload Map<String, Object> payload) {
        Long receiverId = Long.parseLong(payload.get("receiverId").toString());
        String content = payload.get("content").toString();

        Long senderId = userService.getCurrentUserId();
        Message message = messageService.sendMessage(cid, uid, senderId, receiverId, content);

        messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/messages",
                message
        );
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Message>> getMessageHistory(
            @RequestHeader("cid") Long cid,
            @RequestHeader("uid") String uid,
            @PathVariable Long userId) {
        Long currentUserId = userService.getCurrentUserId();
        List<Message> messages = messageService.getMessagesBetweenUsers(cid, uid, currentUserId, userId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Message>> getUnreadMessages(
            @RequestHeader("cid") Long cid,
            @RequestHeader("uid") String uid) {
        Long currentUserId = userService.getCurrentUserId();
        List<Message> unreadMessages = messageService.getUnreadMessages(cid, uid, currentUserId);
        return ResponseEntity.ok(unreadMessages);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(
            @RequestHeader("cid") Long cid,
            @RequestHeader("uid") String uid,
            @PathVariable Long messageId) {
        messageService.markMessageAsRead(cid, uid, messageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recent-users")
    public ResponseEntity<List<Long>> getRecentChatUsers(
            @RequestHeader("cid") Long cid,
            @RequestHeader("uid") String uid) {
        Long currentUserId = userService.getCurrentUserId();
        List<Long> recentUserIds = messageService.getRecentChatUsers(cid, uid, currentUserId);
        return ResponseEntity.ok(recentUserIds);
    }
}