import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button, Snackbar, Alert as MuiAlert } from '@mui/material';
import ChatWindow from './ChatWindow';
import { chatService } from '../../services/chatService';

const Chat = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Initialize chat service and fetch initial data
  useEffect(() => {
    // Cleanup function
    return () => {
      if (chatService.isWebSocketConnected()) {
        chatService.sendUserStatus('OFFLINE');
        chatService.disconnect();
      }
    };
  }, []);

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