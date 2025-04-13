import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import ChatWindow from './chat/ChatWindow';
import { chatService } from '../services/chatService';

const Chat = () => {
  useEffect(() => {
    // Kết nối WebSocket khi component được mount
    const connectWebSocket = async () => {
      try {
        await chatService.connect();
      } catch (error) {
        console.error('Lỗi kết nối WebSocket:', error);
      }
    };

    connectWebSocket();

    // Ngắt kết nối WebSocket khi component unmount
    return () => {
      chatService.disconnect();
    };
  }, []);

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.default' }}>
      <ChatWindow />
    </Box>
  );
};

export default Chat;