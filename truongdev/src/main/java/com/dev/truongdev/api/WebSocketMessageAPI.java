package com.dev.truongdev.api;

import com.dev.truongdev.dto.MessageDTO;
import com.dev.truongdev.service.IMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class WebSocketMessageAPI {

    private final IMessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Xử lý gửi tin nhắn qua WebSocket
     * @param messageDTO Tin nhắn cần gửi
     * @param headerAccessor Header accessor để lấy thông tin session
     * @param principal Principal để lấy thông tin user
     * @return Tin nhắn đã được lưu
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MessageDTO messageDTO, 
                           SimpMessageHeaderAccessor headerAccessor,
                           Principal principal) {
        try {
            // Thiết lập action cho WebSocket message
            messageDTO.setAction("SEND");
            
            // Lưu tin nhắn vào database
            MessageDTO savedMessage = messageService.sendMessage(messageDTO);
            
            // Tạo room ID cho cuộc trò chuyện
            String chatRoomId = messageService.createChatRoomId(
                savedMessage.getSenderId(), 
                savedMessage.getReceiverId()
            );
            savedMessage.setChatRoomId(chatRoomId);
            
            // Gửi tin nhắn đến người nhận qua WebSocket
            messagingTemplate.convertAndSendToUser(
                savedMessage.getReceiverId(),
                "/queue/messages",
                savedMessage
            );
            
            // Gửi tin nhắn về cho người gửi để xác nhận
            messagingTemplate.convertAndSendToUser(
                savedMessage.getSenderId(),
                "/queue/messages",
                savedMessage
            );
            
        } catch (Exception e) {
            // Gửi thông báo lỗi về cho người gửi
            MessageDTO errorMessage = new MessageDTO();
            errorMessage.setAction("ERROR");
            errorMessage.setContent("Không thể gửi tin nhắn: " + e.getMessage());
            
            messagingTemplate.convertAndSendToUser(
                messageDTO.getSenderId(),
                "/queue/errors",
                errorMessage
            );
        }
    }

    /**
     * Xử lý sự kiện người dùng đang gõ tin nhắn
     * @param messageDTO Thông tin typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload MessageDTO messageDTO) {
        messageDTO.setAction("TYPING");
        
        // Gửi thông báo typing đến người nhận
        messagingTemplate.convertAndSendToUser(
            messageDTO.getReceiverId(),
            "/queue/typing",
            messageDTO
        );
    }

    /**
     * Xử lý sự kiện đánh dấu tin nhắn đã đọc
     * @param messageDTO Thông tin tin nhắn đã đọc
     */
    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload MessageDTO messageDTO) {
        try {
            // Đánh dấu tin nhắn đã đọc trong database
            messageService.markMessagesAsRead(messageDTO.getSenderId(), messageDTO.getReceiverId());
            
            messageDTO.setAction("READ");
            
            // Thông báo cho người gửi biết tin nhắn đã được đọc
            messagingTemplate.convertAndSendToUser(
                messageDTO.getSenderId(),
                "/queue/read-receipts",
                messageDTO
            );
            
        } catch (Exception e) {
            // Xử lý lỗi nếu có
            MessageDTO errorMessage = new MessageDTO();
            errorMessage.setAction("ERROR");
            errorMessage.setContent("Không thể đánh dấu đã đọc: " + e.getMessage());
            
            messagingTemplate.convertAndSendToUser(
                messageDTO.getReceiverId(),
                "/queue/errors",
                errorMessage
            );
        }
    }

    /**
     * Xử lý sự kiện người dùng online/offline
     * @param messageDTO Thông tin trạng thái user
     */
    @MessageMapping("/chat.userStatus")
    public void handleUserStatus(@Payload MessageDTO messageDTO) {
        // Broadcast trạng thái user đến tất cả users đang chat với user này
        messagingTemplate.convertAndSend(
            "/topic/user-status/" + messageDTO.getSenderId(),
            messageDTO
        );
    }

    /**
     * Xử lý sự kiện người dùng tham gia chat
     * @param messageDTO Thông tin user join
     * @param headerAccessor Header accessor
     * @return Thông báo join
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public MessageDTO addUser(@Payload MessageDTO messageDTO,
                             SimpMessageHeaderAccessor headerAccessor) {
        // Thêm username vào WebSocket session
        headerAccessor.getSessionAttributes().put("username", messageDTO.getSenderId());
        
        messageDTO.setAction("JOIN");
        messageDTO.setContent(messageDTO.getSenderName() + " đã tham gia chat!");
        
        return messageDTO;
    }
} 