package com.dev.truongdev.config;

import com.dev.truongdev.dto.HandlerWsDto;
import java.util.HashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

@Component
public class MyWebSocketHandler implements WebSocketHandler {

  private static HashMap<String, HandlerWsDto> mapWsDtos = new HashMap<>();

  public void updateTokenByUser(String code, String token) {
    if (mapWsDtos.get(code) != null) {
      HandlerWsDto handlerWsDto = mapWsDtos.get(code);
      handlerWsDto.setToken(token);
      mapWsDtos.put(code, handlerWsDto);
    }
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    // Khi client kết nối thành công
  }

  @Override
  public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
    // Khi client gửi tin nhắn
  }

  @Override
  public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
    // Khi có lỗi xảy ra trong kết nối
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
    // Khi client ngắt kết nối
  }

  @Override
  public boolean supportsPartialMessages() {
    return false; // hoặc true nếu muốn hỗ trợ message từng phần
  }
}

