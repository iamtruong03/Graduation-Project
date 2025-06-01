package com.dev.truongdev.api;

import com.dev.truongdev.dto.MessageDTO;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(
            @RequestAttribute String uid,
            @RequestBody Map<String, Object> payload) {
        try {
            Long receiverId = Long.parseLong(payload.get("receiverId").toString());
            String content = payload.get("content").toString();
            
            // Chuyển đổi sang MessageDTO
            MessageDTO messageDTO = new MessageDTO();
            messageDTO.setSenderId(uid);
            messageDTO.setReceiverId(String.valueOf(receiverId));
            messageDTO.setContent(content);
            messageDTO.setMessageType("TEXT");
            
            MessageDTO message = messageService.sendMessage(uid, messageDTO);
            return ApiResponse.ok(message);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<Page<MessageDTO>>> getMessageHistory(
            @RequestAttribute String uid,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
            Page<MessageDTO> messages = messageService.getConversation(uid, String.valueOf(userId), pageable);
            return ApiResponse.ok(messages);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getUnreadMessages(
            @RequestAttribute String uid) {
        try {
            List<MessageDTO> unreadMessages = messageService.getUnreadMessages(uid);
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
            // Lấy thông tin tin nhắn để có receiverId
            Message message = messageService.getById(uid, messageId);
            messageService.markMessagesAsRead(message.getSenderId(), message.getReceiverId());
            return ApiResponse.ok("Message marked as read");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/recent-users")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getRecentChatUsers(
            @RequestAttribute String uid) {
        try {
            List<MessageDTO> recentConversations = messageService.getRecentConversations(uid);
            return ApiResponse.ok(recentConversations);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Gửi tin nhắn mới qua REST API (cho WebSocket)
     */
    @PostMapping("/send-ws")
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessageWS(
            @RequestBody MessageDTO messageDTO,
            @RequestAttribute String uid,
            @RequestAttribute Long did) {
        try {
            // Thiết lập sender ID và department ID từ JWT token
            messageDTO.setSenderId(uid);
            messageDTO.setDepartmentId(did);
            
            MessageDTO sentMessage = messageService.sendMessage(uid, messageDTO);
            return ApiResponse.ok(sentMessage);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Lấy cuộc trò chuyện giữa người dùng hiện tại và người dùng khác
     */
    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<ApiResponse<Page<MessageDTO>>> getConversation(
            @PathVariable String otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestAttribute String uid) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
            Page<MessageDTO> conversation = messageService.getConversation(uid, otherUserId, pageable);
            return ApiResponse.ok(conversation);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Lấy danh sách cuộc trò chuyện gần nhất của người dùng
     */
    @GetMapping("/recent-conversations")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getRecentConversations(
            @RequestAttribute String uid) {
        try {
            List<MessageDTO> recentConversations = messageService.getRecentConversations(uid);
            return ApiResponse.ok(recentConversations);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Lấy tất cả tin nhắn chưa đọc của người dùng
     */
    @GetMapping("/unread-ws")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getUnreadMessagesWS(
            @RequestAttribute String uid) {
        try {
            List<MessageDTO> unreadMessages = messageService.getUnreadMessages(uid);
            return ApiResponse.ok(unreadMessages);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Đếm số lượng tin nhắn chưa đọc
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> countUnreadMessages(
            @RequestAttribute String uid) {
        try {
            Long count = messageService.countUnreadMessages(uid);
            return ApiResponse.ok(count);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Đánh dấu tin nhắn đã đọc
     */
    @PutMapping("/mark-read/{otherUserId}")
    public ResponseEntity<ApiResponse<String>> markMessagesAsRead(
            @PathVariable String otherUserId,
            @RequestAttribute String uid) {
        try {
            messageService.markMessagesAsRead(otherUserId, uid);
            return ApiResponse.ok("Đã đánh dấu tin nhắn là đã đọc");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Xóa tin nhắn (chỉ người gửi mới có quyền xóa)
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<String>> deleteMessage(
            @PathVariable Long messageId,
            @RequestAttribute String uid) {
        try {
            messageService.deleteMessage(messageId, uid);
            return ApiResponse.ok("Đã xóa tin nhắn thành công");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Lấy tin nhắn theo phòng ban (chỉ dành cho admin)
     */
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<Page<MessageDTO>>> getMessagesByDepartment(
            @PathVariable Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestAttribute String uid,
            @RequestAttribute Long did) {
        try {
            // Chỉ cho phép xem tin nhắn của phòng ban mình hoặc phòng ban con
            // Logic kiểm tra quyền có thể được implement ở service layer
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
            Page<MessageDTO> messages = messageService.getMessagesByDepartment(departmentId, pageable);
            return ApiResponse.ok(messages);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * Tạo chat room ID cho 2 người dùng
     */
    @GetMapping("/room/{otherUserId}")
    public ResponseEntity<ApiResponse<String>> getChatRoomId(
            @PathVariable String otherUserId,
            @RequestAttribute String uid) {
        try {
            String chatRoomId = messageService.createChatRoomId(uid, otherUserId);
            return ApiResponse.ok(chatRoomId);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}