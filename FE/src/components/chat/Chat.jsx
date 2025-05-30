import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ChatWindow from './ChatWindow';
import { chatService } from '../../services/chatService';

const Chat = () => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        setIsConnecting(true);
        await chatService.connect();
        setError(null);
      } catch (error) {
        console.error('Lỗi kết nối WebSocket:', error);
        setError('Không thể kết nối đến máy chủ chat. Vui lòng thử lại sau.');
      } finally {
        setIsConnecting(false);
      }
    };

    connectWebSocket();

    return () => {
      chatService.disconnect();
    };
  }, []);

  if (isConnecting) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.default' }}>
      <ChatWindow />
    </Box>
  );
};

export default Chat;