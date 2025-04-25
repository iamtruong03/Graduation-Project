import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Badge } from '@mui/material';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { styled } from '@mui/material/styles';
import api from '../../services/api';
import { chatService } from '../../services/chatService';

const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const ChatWindow = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);
  const [cid, setCid] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng hiện tại
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/user/current-user');
        setDepartmentId(response.data.departmentId);
        setCid(response.data.cid);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchUserInfo();

    // Đăng ký nhận cập nhật danh sách người dùng trực tuyến
    const unsubscribe = chatService.onOnlineUsersUpdate(users => {
      setOnlineUsers(users);
    });

    // Lấy danh sách người dùng chat gần đây
    chatService.getRecentChatUsers()
      .then(users => setRecentUsers(users))
      .catch(error => console.error('Lỗi khi lấy danh sách người dùng chat gần đây:', error));

    // Lấy danh sách tin nhắn chưa đọc
    chatService.getUnreadMessages()
      .then(messages => setUnreadMessages(messages))
      .catch(error => console.error('Lỗi khi lấy tin nhắn chưa đọc:', error));

    return () => unsubscribe();
  }, []);

  // Đánh dấu tin nhắn đã đọc khi người dùng xem tin nhắn
  const markMessagesAsRead = (messages) => {
    messages.forEach(message => {
      if (!message.isRead) {
        chatService.markMessageAsRead(message.id)
          .catch(error => console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error));
      }
    });
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', p: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Danh sách người dùng trực tuyến */}
        <Grid item xs={3}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              Người dùng trực tuyến
            </Typography>
            <List>
              {onlineUsers.map((user) => (
                <ListItem 
                  button 
                  key={user.id}
                  selected={selectedUser?.id === user.id}
                  onClick={() => handleUserSelect(user)}
                >
                  <ListItemAvatar>
                    <OnlineBadge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                    >
                      <Avatar>{user.avatar}</Avatar>
                    </OnlineBadge>
                  </ListItemAvatar>
                  <ListItemText primary={user.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Khung chat */}
        <Grid item xs={9}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedUser ? (
              <>
                <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  {selectedUser.name}
                </Typography>
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  <MessageList 
                    selectedUser={selectedUser}
                    departmentId={departmentId}
                    cid={cid}
                  />
                </Box>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <MessageInput 
                    selectedUser={selectedUser}
                    departmentId={departmentId}
                    cid={cid}
                  />
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body1" color="textSecondary">
                  Chọn một người dùng để bắt đầu trò chuyện
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatWindow;