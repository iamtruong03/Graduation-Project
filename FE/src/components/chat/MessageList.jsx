import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import api from '../../services/api';

const MessageList = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/user/current-user');
        setCurrentUserId(response.data.data.id);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error);
      }
    };

    const fetchMessages = async () => {
      if (selectedUser) {
        setLoading(true);
        try {
          const response = await api.get(`/api/messages/history/${selectedUser.id}`);
          // Kiểm tra response.data tồn tại trước khi truy cập
          if (response?.data?.data) {
            setMessages(response.data.data);
            
            // Kiểm tra mảng trước khi filter
            const unreadMessages = response.data.data.filter(
              msg => !msg.isRead && msg.senderId === selectedUser.id
            );
            
            // Đánh dấu đã đọc cho các tin nhắn chưa đọc
            unreadMessages.forEach(async (msg) => {
              try {
                await api.put(`/api/messages/${msg.id}/read`);
              } catch (error) {
                console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
              }
            });
          } else {
            setMessages([]); // Set mảng rỗng nếu không có dữ liệu
          }
        } catch (error) {
          console.error('Lỗi khi lấy lịch sử tin nhắn:', error);
          setMessages([]); // Set mảng rỗng nếu có lỗi
        }
      }
    };

    fetchCurrentUser();
    fetchMessages();

    // Thiết lập interval để cập nhật tin nhắn mỗi 5 giây
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  const MessageBubble = ({ message, isCurrentUser }) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2,
        maxWidth: '80%',
        marginLeft: isCurrentUser ? 'auto' : 0,
        marginRight: isCurrentUser ? 0 : 'auto'
      }}
    >
      {!isCurrentUser && (
        <Avatar 
          sx={{ 
            mr: 1,
            width: 36,
            height: 36,
            bgcolor: 'secondary.main'
          }}
        >
          {message.senderName.charAt(0)}
        </Avatar>
      )}
      <Box>
        {!isCurrentUser && (
          <Typography 
            variant="caption" 
            sx={{ 
              ml: 1,
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            {message.senderName}
          </Typography>
        )}
        <Paper
          sx={{
            p: 1.5,
            backgroundColor: isCurrentUser ? 'primary.main' : '#f5f5f5',
            color: isCurrentUser ? 'white' : 'black',
            borderRadius: 2,
            mt: 0.5,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 10,
              [isCurrentUser ? 'right' : 'left']: -6,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '6px 6px 6px 0',
              borderColor: `transparent ${isCurrentUser ? '#1976d2' : '#f5f5f5'} transparent transparent`,
              transform: isCurrentUser ? 'rotate(180deg)' : 'none'
            }
          }}
        >
          <Box>
            <Typography 
              variant="body1" 
              sx={{ 
                wordBreak: 'break-word',
                lineHeight: 1.4
              }}
            >
              {message.content}
            </Typography>
            {isCurrentUser && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'right',
                  color: message.isRead ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)',
                  fontSize: '0.7rem',
                  mt: 0.5
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
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}
        >
          {format(message.timestamp, 'HH:mm', { locale: vi })}
        </Typography>
      </Box>
      {isCurrentUser && (
        <Avatar 
          sx={{ 
            ml: 1,
            width: 36,
            height: 36,
            bgcolor: 'primary.main'
          }}
        >
          {message.senderName.charAt(0)}
        </Avatar>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : Array.isArray(messages) && messages.length > 0 ? (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === currentUserId}
          />
        ))
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="text.secondary">
            Chưa có tin nhắn nào
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MessageList;