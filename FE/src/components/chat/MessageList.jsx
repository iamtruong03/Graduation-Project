import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { chatService } from '../../services/chatService';

const MessageList = ({ selectedUser, departmentId, cid }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribes = [];

    if (selectedUser) {
      // Lấy lịch sử tin nhắn khi chọn người dùng
      chatService.getMessageHistory(selectedUser.id)
        .then(history => {
          setMessages(history);
          // Đánh dấu tin nhắn đã đọc
          const unreadMessages = history.filter(msg => !msg.isRead && msg.senderId === selectedUser.id);
          unreadMessages.forEach(msg => chatService.markMessageAsRead(msg.id));
        })
        .catch(error => console.error('Lỗi khi lấy lịch sử tin nhắn:', error));

      // Đăng ký nhận tin nhắn cá nhân
      unsubscribes.push(chatService.onMessage(newMessage => {
        if (newMessage.senderId === selectedUser.id || newMessage.receiverId === selectedUser.id) {
          setMessages(prev => [...prev, newMessage]);
        }
      }));
    }

    // Đăng ký nhận tin nhắn phòng ban
    if (departmentId) {
      unsubscribes.push(chatService.onDepartmentMessage(newMessage => {
        setMessages(prev => [...prev, newMessage]);
      }));
    }

    // Đăng ký nhận tin nhắn toàn công ty
    if (cid) {
      unsubscribes.push(chatService.onCompanyMessage(newMessage => {
        setMessages(prev => [...prev, newMessage]);
      }));
    }

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [selectedUser]);

  const currentUserId = 1; // Giả lập ID người dùng hiện tại

  const MessageBubble = ({ message, isCurrentUser }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      {!isCurrentUser && (
        <Avatar sx={{ mr: 1 }}>
          {message.senderName.charAt(0)}
        </Avatar>
      )}
      <Box>
        {!isCurrentUser && (
          <Typography variant="caption" sx={{ ml: 1 }}>
            {message.senderName}
          </Typography>
        )}
        <Paper
          sx={{
            p: 1,
            backgroundColor: isCurrentUser ? '#1976d2' : '#f5f5f5',
            color: isCurrentUser ? 'white' : 'black',
            maxWidth: '70%',
            borderRadius: 2,
            mt: 0.5
          }}
        >
          <Box>
            <Typography variant="body1">{message.content}</Typography>
            {isCurrentUser && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  color: message.isRead ? 'text.secondary' : 'primary.main',
                  fontSize: '0.7rem'
                }}
              >
                {message.isRead ? 'Đã xem' : 'Đã gửi'}
              </Typography>
            )}
          </Box>
        </Paper>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: isCurrentUser ? 'right' : 'left',
            mt: 0.5,
            color: 'text.secondary'
          }}
        >
          {format(message.timestamp, 'HH:mm', { locale: vi })}
        </Typography>
      </Box>
      {isCurrentUser && (
        <Avatar sx={{ ml: 1 }}>
          {message.senderName.charAt(0)}
        </Avatar>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === currentUserId}
        />
      ))}
    </Box>
  );
};

export default MessageList;