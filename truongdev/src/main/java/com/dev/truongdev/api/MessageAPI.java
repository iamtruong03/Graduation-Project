package com.dev.truongdev.api;

import com.dev.truongdev.entity.Message;
import com.dev.truongdev.payload.filter.MessageFilter;
import com.dev.truongdev.service.IMessageService;
import com.dev.truongdev.service.IUserService;
import com.dev.truongdev.utils.ApiResponse;
import com.dev.truongdev.xdevbase.api.XDevBaseAPI;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageAPI extends XDevBaseAPI<Message, MessageFilter> {

    final IMessageService messageService;
    final IUserService userService;

    @Override
    public IXDevBaseService<Message, MessageFilter> getService() {
        return messageService;
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Message>> sendMessage(
            @RequestAttribute String uid,
            @RequestBody Map<String, Object> payload) {
        try {
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());
            String content = payload.get("content").toString();
            
            Message message = messageService.sendMessage(uid, receiverId, content);
            return ApiResponse.ok(message);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<List<Message>>> getMessageHistory(
            @RequestAttribute String uid,
            @PathVariable Long userId) {
        try {
            List<Message> messages = messageService.getMessagesBetweenUsers(uid, userId);
            return ApiResponse.ok(messages);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Message>>> getUnreadMessages(
            @RequestAttribute String uid) {
        try {
            Long currentUserId = Long.parseLong(uid);
            List<Message> unreadMessages = messageService.getUnreadMessages(uid, currentUserId);
            return ApiResponse.ok(unreadMessages);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<ApiResponse<String>> markMessageAsRead(
            @RequestAttribute String uid,
            @PathVariable Long messageId) {
        try {
            messageService.markMessageAsRead(uid, messageId);
            return ApiResponse.ok("Message marked as read");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/recent-users")
    public ResponseEntity<ApiResponse<List<Long>>> getRecentChatUsers(
            @RequestAttribute String uid) {
        try {
            Long currentUserId = Long.parseLong(uid);
            List<Long> recentUserIds = messageService.getRecentChatUsers(uid, currentUserId);
            return ApiResponse.ok(recentUserIds);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}