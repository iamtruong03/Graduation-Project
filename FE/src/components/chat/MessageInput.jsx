import React, { useState } from 'react';
import { Box, TextField, IconButton, Select, MenuItem, FormControl } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { chatService } from '../../services/chatService';

const MessageInput = ({ selectedUser, departmentId, cid }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('PERSONAL');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        const groupId = messageType === 'DEPARTMENT' ? departmentId : messageType === 'COMPANY' ? cid : null;
        chatService.sendMessage(
          messageType === 'PERSONAL' ? selectedUser.id : null,
          message.trim(),
          messageType,
          groupId
        );
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
        gap: 1
      }}
    >
      <FormControl sx={{ minWidth: 120, mr: 1 }}>
        <Select
          size="small"
          value={messageType}
          onChange={(e) => setMessageType(e.target.value)}
        >
          <MenuItem value="PERSONAL">Cá nhân</MenuItem>
          <MenuItem value="DEPARTMENT">Phòng ban</MenuItem>
          <MenuItem value="COMPANY">Toàn công ty</MenuItem>
        </Select>
      </FormControl>
      <TextField
        fullWidth
        size="small"
        placeholder="Nhập tin nhắn..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3
          }
        }}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={!message.trim()}
        sx={{
          borderRadius: 2
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;