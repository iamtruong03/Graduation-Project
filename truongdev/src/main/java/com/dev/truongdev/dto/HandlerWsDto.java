package com.dev.truongdev.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

@Getter
@Setter
public class HandlerWsDto {
  WebSocketSession session;
  String token;
}
