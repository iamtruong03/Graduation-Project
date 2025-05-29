package com.dev.truongdev.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Cấu hình message broker để xử lý tin nhắn
     * @param config Message broker registry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Bật simple broker cho các destination bắt đầu với "/topic" hoặc "/queue"
        config.enableSimpleBroker("/topic", "/queue");
        
        // Thiết lập prefix cho các message mapping ở controller
        config.setApplicationDestinationPrefixes("/app");
        
        // Thiết lập prefix cho user-specific destinations
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Đăng ký STOMP endpoints
     * @param registry STOMP endpoint registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint cho WebSocket connection
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Cho phép tất cả origin (chỉ cho development)
                .withSockJS(); // Fallback cho các browser không support WebSocket
        
        // Endpoint cho chat messaging
        registry.addEndpoint("/chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}