import React, { useState, useEffect, useRef } from 'react';
import { Box, Avatar, Typography, Paper, CircularProgress, Chip } from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { chatService } from '../../services/chatService';
import api from '../../services/api';

const MessageList = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeouts = useRef(new Map());

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/user/current-user');
        console.log('Current user response:', response);
        if (response?.data && response.data.id) {
          const userId = response.data.id.toString();
          console.log('Current user ID:', userId);
          setCurrentUserId(userId);
          setUserMap(prev => ({
            ...prev,
            [userId]: response.data
          }));
        } else if (response?.data?.data && response.data.data.id) {
          const userId = response.data.data.id.toString();
          console.log('Current user ID (from data.data):', userId);
          setCurrentUserId(userId);
          setUserMap(prev => ({
            ...prev,
            [userId]: response.data.data
          }));
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch user info by ID
  const fetchUserInfo = async (userId) => {
    if (userMap[userId]) return userMap[userId];
    
    try {
      const response = await api.get(`/user/${userId}`);
      console.log(`User info for ${userId}:`, response);
      let userData = null;
      
      if (response?.data?.data) {
        userData = response.data.data;
      } else if (response?.data && response.data.id) {
        userData = response.data;
      }
      
      if (userData) {
        setUserMap(prev => ({
          ...prev,
          [userId]: userData
        }));
        return userData;
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, error);
    }
    return null;
  };

  // Load conversation messages
  const loadMessages = async () => {
    if (!selectedUser || !currentUserId) return;

    setLoading(true);
    try {
      const response = await chatService.getConversation(selectedUser.id.toString(), 0, 50);
      console.log('Conversation response:', response);
      
      if (response && response.content && Array.isArray(response.content)) {
        const messagesData = response.content;
        console.log('Messages data:', messagesData);
        
        // Fetch user info for all senders
        const uniqueUserIds = [...new Set(messagesData.map(msg => msg.senderId).filter(id => id != null))];
        await Promise.all(uniqueUserIds.map(userId => fetchUserInfo(userId)));
        
        // Sort messages by timestamp
        const sortedMessages = [...messagesData].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        setMessages(sortedMessages);
        
        // Mark messages as read via WebSocket
        if (messagesData.some(msg => !msg.isRead && msg.senderId === selectedUser.id.toString())) {
          chatService.markMessagesAsRead(selectedUser.id.toString());
        }
      } else {
        console.log('No messages found or invalid response format');
        setMessages([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy cuộc trò chuyện:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle typing timeout
  const handleTypingTimeout = (userId) => {
    if (typingTimeouts.current.has(userId)) {
      clearTimeout(typingTimeouts.current.get(userId));
    }
    
    const timeout = setTimeout(() => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      typingTimeouts.current.delete(userId);
    }, 3000);
    
    typingTimeouts.current.set(userId, timeout);
  };

  // Set up WebSocket listeners
  useEffect(() => {
    if (!chatService.isWebSocketConnected()) return;

    // Listen for new messages
    const unsubscribeMessage = chatService.onMessage((messageData) => {
      console.log('Received new message:', messageData);
      
      // Only add message if it's part of current conversation
      if (selectedUser && (
        (messageData.senderId === selectedUser.id.toString() && messageData.receiverId === currentUserId) ||
        (messageData.senderId === currentUserId && messageData.receiverId === selectedUser.id.toString())
      )) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(msg => msg.id === messageData.id)) {
            return prev;
          }
          
          // Add new message and sort
          const newMessages = [...prev, messageData];
          return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });

        // Fetch sender info if not available
        if (messageData.senderId && !userMap[messageData.senderId]) {
          fetchUserInfo(messageData.senderId);
        }

        // Mark as read if received from selected user
        if (messageData.senderId === selectedUser.id.toString()) {
          chatService.markMessagesAsRead(messageData.senderId);
        }
      }
    });

    // Listen for typing notifications
    const unsubscribeTyping = chatService.onTyping((typingData) => {
      console.log('Received typing notification:', typingData);
      
      if (selectedUser && typingData.senderId === selectedUser.id.toString()) {
        setTypingUsers(prev => new Set(prev).add(typingData.senderId));
        handleTypingTimeout(typingData.senderId);
      }
    });

    // Listen for read receipts
    const unsubscribeReadReceipt = chatService.onReadReceipt((readData) => {
      console.log('Received read receipt:', readData);
      
      // Update message read status
      setMessages(prev => prev.map(msg => {
        if (msg.senderId === currentUserId && msg.receiverId === readData.senderId) {
          return { ...msg, isRead: true };
        }
        return msg;
      }));
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeReadReceipt();
    };
  }, [selectedUser, currentUserId, userMap]);

  // Load messages when selectedUser changes
  useEffect(() => {
    if (selectedUser && currentUserId) {
      loadMessages();
    }
  }, [selectedUser, currentUserId]);

  // Cleanup typing timeouts
  useEffect(() => {
    return () => {
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, []);

  const MessageBubble = ({ message, isCurrentUser }) => {
    const sender = userMap[message?.senderId];
    const senderName = sender?.name || (message?.senderId ? `User ${message.senderId}` : 'Unknown User');

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
                  color: message?.isRead ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)',
                  fontSize: '0.7rem',
                  mt: 0.5
                }}
              >
                {message?.isRead ? 'Đã xem' : 'Đã gửi'}
              </Typography>
            )}
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

  const TypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    const typingUserNames = Array.from(typingUsers).map(userId => {
      const user = userMap[userId];
      return user?.name || `User ${userId}`;
    });

    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <Chip
          size="small"
          label={`${typingUserNames.join(', ')} đang gõ...`}
          sx={{
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            fontSize: '0.75rem'
          }}
        />
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', pb: 2 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : Array.isArray(messages) && messages.length > 0 ? (
        <>
          {messages.map((message) => (
            <MessageBubble
              key={message.id || `${message.senderId}-${message.timestamp}`}
              message={message}
              isCurrentUser={message.senderId === currentUserId}
            />
          ))}
          <TypingIndicator />
          <div ref={messagesEndRef} />
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="text.secondary">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MessageList;