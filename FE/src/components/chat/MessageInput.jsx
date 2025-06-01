import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, CircularProgress, Snackbar, Alert as MuiAlert } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { chatService } from '../../services/chatService';

const MessageInput = ({ selectedUser, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const typingTimeoutRef = useRef(null);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle typing notifications
  const handleTyping = () => {
    if (!isTyping && selectedUser) {
      setIsTyping(true);
      chatService.sendTypingNotification(selectedUser.id);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing notification
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser && !isSending) {
      setIsSending(true);
      try {
        // Send message via WebSocket
        await chatService.sendMessage(selectedUser.id, message.trim(), 'TEXT');
        
        setMessage('');
        setIsTyping(false);
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Notify parent component that message was sent
        if (onMessageSent) {
          onMessageSent();
        }

        setSnackbar({
          open: true,
          message: 'Tin nhắn đã được gửi',
          severity: 'success'
        });
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        setSnackbar({
          open: true,
          message: 'Không thể gửi tin nhắn. Vui lòng thử lại',
          severity: 'error'
        });
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleSendMessage}
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-end',
        p: 1
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={selectedUser ? `Nhập tin nhắn cho ${selectedUser.name}...` : "Nhập tin nhắn..."}
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={!selectedUser || isSending}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 25,
            backgroundColor: '#f1f1f1',
            '&:hover': {
              backgroundColor: '#e0e0e0'
            },
            '& fieldset': {
              borderColor: 'transparent'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.23)'
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main'
            }
          }
        }}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={!message.trim() || !selectedUser || isSending}
        sx={{
          width: 48,
          height: 48,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark'
          },
          '&.Mui-disabled': {
            backgroundColor: 'action.disabledBackground',
            color: 'action.disabled'
          }
        }}
      >
        {isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
      </IconButton>

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

export default MessageInput;