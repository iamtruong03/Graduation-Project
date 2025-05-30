import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import api from '../../services/api';

const MessageList = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/user/current-user');
        console.log('Current user response:', response);
        if (response?.data && response.data.id) {
          const userId = response.data.id;
          console.log('Current user ID:', userId);
          setCurrentUserId(userId);
          // Lưu thông tin người dùng hiện tại vào userMap
          setUserMap(prev => ({
            ...prev,
            [userId]: response.data
          }));
        } else if (response?.data?.data && response.data.data.id) {
          const userId = response.data.data.id;
          console.log('Current user ID (from data.data):', userId);
          setCurrentUserId(userId);
          // Lưu thông tin người dùng hiện tại vào userMap
          setUserMap(prev => ({
            ...prev,
            [userId]: response.data.data
          }));
        } else {
          console.error('Không tìm thấy ID người dùng trong response hoặc response không hợp lệ:', response);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error);
      }
    };

    const fetchUserInfo = async (userId) => {
      try {
        const response = await api.get(`/user/${userId}`);
        console.log(`User info for ${userId}:`, response);
        if (response?.data?.data) {
          setUserMap(prev => ({
            ...prev,
            [userId]: response.data.data
          }));
        } else if (response?.data && response.data.id) {
          setUserMap(prev => ({
            ...prev,
            [userId]: response.data
          }));
        }
      } catch (error) {
        console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, error);
      }
    };

    const fetchMessages = async () => {
      if (selectedUser) {
        setLoading(true);
        try {
          const response = await api.get(`/api/messages/history/${selectedUser.id}`);
          console.log('Response from API:', response);
          
          // Kiểm tra response và data
          // Dữ liệu tin nhắn nằm trực tiếp trong response.data
          if (response?.data && Array.isArray(response.data)) {
            const messagesData = response.data; // Lấy dữ liệu từ response.data
            console.log('Messages data extracted from response.data:', messagesData);
            
            if (messagesData.length > 0) {
              // Lấy thông tin người gửi cho mỗi tin nhắn
              const uniqueUserIds = [...new Set(messagesData.map(msg => msg.senderId).filter(id => id != null))];
              console.log('Unique user IDs for fetching info:', uniqueUserIds);
              
              // Lấy thông tin người dùng cho mỗi ID
              // Đảm bảo fetchUserInfo trả về Promise.resolve() nếu không có ID hợp lệ
              await Promise.all(uniqueUserIds.map(userId => userId ? fetchUserInfo(userId) : Promise.resolve()));
              
              // Sắp xếp tin nhắn theo thời gian
              const sortedMessages = [...messagesData].sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
              );
              
              setMessages(sortedMessages);
              console.log('Messages set to state:', sortedMessages);
              
              // Đánh dấu tin nhắn đã đọc
              const unreadMessages = messagesData.filter(
                msg => !msg.read && msg.senderId === selectedUser.id
              );
              
              unreadMessages.forEach(async (msg) => {
                try {
                  // Kiểm tra msg.id tồn tại trước khi gọi API
                  if(msg.id) {
                    await api.put(`/api/messages/${msg.id}/read`);
                  }
                } catch (error) {
                  console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
                }
              });
            } else {
              console.log('API returned empty messages array in response.data.');
              setMessages([]);
            }
          } else {
            console.error('Response API tin nhắn không hợp lệ hoặc data không phải là mảng:', response);
            setMessages([]);
          }
        } catch (error) {
          console.error('Lỗi khi lấy lịch sử tin nhắn:', error);
          setMessages([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  const MessageBubble = ({ message, isCurrentUser }) => {
    const sender = userMap[message?.senderId];
    const senderName = sender?.name || (message?.senderId ? `User ${message.senderId}` : 'Unknown User');
    console.log('Message bubble data:', { message, sender, senderName, userMap });

    return (
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
            {senderName ? senderName.charAt(0) : '?'}
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
              {senderName}
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
                {message?.content || ''}
              </Typography>
              {isCurrentUser && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    color: message?.read ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)',
                    fontSize: '0.7rem',
                    mt: 0.5
                  }}
                >
                  {message?.read ? 'Đã xem' : 'Đã gửi'}
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
            {message?.timestamp ? format(new Date(message.timestamp), 'HH:mm', { locale: vi }) : ''}
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
            {senderName ? senderName.charAt(0) : '?'}
          </Avatar>
        )}
      </Box>
    );
  };

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