import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button, Snackbar, Alert as MuiAlert } from '@mui/material';
import ChatWindow from './ChatWindow';
import { chatService } from '../../services/chatService';

const Chat = () => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        setIsConnecting(true);
        setError(null);
        
        // Check if token exists
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('code');
        
        if (!token || !userId) {
          throw new Error('Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.');
        }

        await chatService.connect();
        setIsConnected(true);
        setSnackbar({
          open: true,
          message: 'Kết nối thành công',
          severity: 'success'
        });
        console.log('Chat service connected successfully');
        
      } catch (error) {
        console.error('Lỗi kết nối WebSocket:', error);
        setError(error.message || 'Không thể kết nối đến máy chủ chat. Vui lòng thử lại sau.');
        setIsConnected(false);
        setSnackbar({
          open: true,
          message: error.message || 'Không thể kết nối đến máy chủ chat',
          severity: 'error'
        });
      } finally {
        setIsConnecting(false);
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (chatService.isWebSocketConnected()) {
        chatService.sendUserStatus('OFFLINE');
        chatService.disconnect();
      }
    };
  }, []);

  const handleReconnect = () => {
    setIsConnecting(true);
    setError(null);
    
    // Retry connection after a short delay
    setTimeout(async () => {
      try {
        await chatService.connect();
        setIsConnected(true);
        setError(null);
        setSnackbar({
          open: true,
          message: 'Kết nối lại thành công',
          severity: 'success'
        });
      } catch (error) {
        console.error('Reconnection failed:', error);
        setError(error.message || 'Không thể kết nối lại. Vui lòng thử lại.');
        setIsConnected(false);
        setSnackbar({
          open: true,
          message: error.message || 'Không thể kết nối lại',
          severity: 'error'
        });
      } finally {
        setIsConnecting(false);
      }
    }, 1000);
  };

  if (isConnecting) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Đang kết nối đến máy chủ chat...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 3,
        p: 3
      }}>
        <MuiAlert 
          severity="error" 
          sx={{ 
            maxWidth: 500,
            '& .MuiAlert-message': {
              fontSize: '1.1rem'
            }
          }}
        >
          {error}
        </MuiAlert>
        <Button 
          variant="contained" 
          onClick={handleReconnect}
          size="large"
          sx={{ minWidth: 150 }}
        >
          Thử lại
        </Button>
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 3
      }}>
        <Typography variant="h6" color="text.secondary">
          Không thể kết nối đến máy chủ chat
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleReconnect}
          size="large"
        >
          Kết nối lại
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      bgcolor: 'background.default',
      overflow: 'hidden'
    }}>
      <ChatWindow />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Chat;