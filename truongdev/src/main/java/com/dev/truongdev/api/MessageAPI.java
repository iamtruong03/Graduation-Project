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
            @RequestHeader("uid") String uid,
            @Payload Map<String, Object> payload) {
        try {
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());
            String content = payload.get("content").toString();

            Long senderId = userService.getCurrentUserId();
            Message message = messageService.sendMessage(uid, senderId, receiverId, content);

            messagingTemplate.convertAndSendToUser(
                    receiverId.toString(),
                    "/queue/messages",
                    message
            );
            
            // Log successful message delivery
            System.out.println("Message sent from " + senderId + " to " + receiverId);
        } catch (Exception e) {
            // Log error details
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            e.printStackTrace();
            
            // Optionally send error notification to client
            messagingTemplate.convertAndSendToUser(
                    userService.getCurrentUserId().toString(),
                    "/queue/errors",
                    "Error processing message: " + e.getMessage()
            );
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Message>> getMessageHistory(
            @RequestHeader("uid") String uid,
            @PathVariable Long userId) {
        Long currentUserId = userService.getCurrentUserId();
        List<Message> messages = messageService.getMessagesBetweenUsers(uid, currentUserId, userId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Message>> getUnreadMessages(
            @RequestHeader("uid") String uid) {
        Long currentUserId = userService.getCurrentUserId();
        List<Message> unreadMessages = messageService.getUnreadMessages(uid, currentUserId);
        return ResponseEntity.ok(unreadMessages);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(
            @RequestHeader("uid") String uid,
            @PathVariable Long messageId) {
        messageService.markMessageAsRead(uid, messageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recent-users")
    public ResponseEntity<List<Long>> getRecentChatUsers(
            @RequestHeader("uid") String uid) {
        Long currentUserId = userService.getCurrentUserId();
        List<Long> recentUserIds = messageService.getRecentChatUsers(uid, currentUserId);
        return ResponseEntity.ok(recentUserIds);
    }
}