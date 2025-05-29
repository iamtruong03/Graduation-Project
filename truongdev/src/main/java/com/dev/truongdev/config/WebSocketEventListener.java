package com.dev.truongdev.config;

import com.dev.truongdev.dto.MessageDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    /**
     * Xử lý sự kiện khi người dùng kết nối WebSocket
     * @param event Sự kiện kết nối
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("Received a new web socket connection");
    }

    /**
     * Xử lý sự kiện khi người dùng ngắt kết nối WebSocket
     * @param event Sự kiện ngắt kết nối
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        if (username != null) {
            log.info("User Disconnected: " + username);
            
            // Tạo message thông báo user offline
            MessageDTO chatMessage = new MessageDTO();
            chatMessage.setAction("OFFLINE");
            chatMessage.setSenderId(username);
            chatMessage.setContent(username + " đã rời khỏi chat");
            
            // Broadcast thông báo user offline
            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }
} 