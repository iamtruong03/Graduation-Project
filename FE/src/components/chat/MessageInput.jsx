import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '../../services/api';

const MessageInput = ({ selectedUser }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        await api.post('/api/messages/send', {
          receiverId: selectedUser.id,
          content: message.trim()
        });
        setMessage('');
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
      }
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSendMessage}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'flex-end'
      }}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Nhập tin nhắn..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            backgroundColor: '#f8f9fa',
            '&:hover': {
              backgroundColor: '#f5f5f5'
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
        disabled={!message.trim()}
        sx={{
          width: 45,
          height: 45,
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
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;