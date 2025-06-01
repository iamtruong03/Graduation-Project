import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Badge, Divider, IconButton, InputAdornment, TextField, Chip, CircularProgress, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Initialize chat service
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setConnectionStatus('connecting');
        await chatService.connect();
        setConnectionStatus('connected');
        
        // Join chat and send online status
        chatService.joinChat();
        chatService.sendUserStatus('ONLINE');
        
        // Load unread counts
        await loadUnreadCounts();
        
      } catch (error) {
        console.error('Lỗi khởi tạo chat:', error);
        setConnectionStatus('error');
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (chatService.isWebSocketConnected()) {
        chatService.sendUserStatus('OFFLINE');
        chatService.disconnect();
      }
    };
  }, []);

  // Load users list
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setUsersError(null);
      try {
        const response = await api.get('/user/list');
        console.log('Response from /user/list API:', response);
        
        if (response?.data && Array.isArray(response.data)) {
          const usersData = response.data;
          const currentUserId = localStorage.getItem('code');
          const filteredUsers = usersData.filter(user => 
            user.id !== parseInt(currentUserId)
          );
          console.log('Filtered users from /user/list:', filteredUsers);
          setUsers(filteredUsers);
          setIsLoadingUsers(false);
        } else {
          console.error('Response từ API /user/list không hợp lệ:', response);
          setUsers([]);
          setUsersError('Không thể tải danh sách người dùng.');
          setIsLoadingUsers(false);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        setUsers([]);
        setUsersError('Lỗi khi tải danh sách người dùng: ' + (error.message || 'Không xác định'));
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Load unread message counts
  const loadUnreadCounts = async () => {
    try {
      const totalCount = await chatService.countUnreadMessages();
      console.log('Total unread messages:', totalCount);
      
      // You could also load per-user unread counts here if needed
      // For now, we'll use the total count
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  // Set up WebSocket event listeners
  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    // Listen for new messages to update unread counts
    const unsubscribeMessage = chatService.onMessage((messageData) => {
      // Update unread count for the sender
      if (messageData.senderId !== localStorage.getItem('code')) {
        setUnreadCounts(prev => ({
          ...prev,
          [messageData.senderId]: (prev[messageData.senderId] || 0) + 1
        }));
      }
    });

    // Listen for user status updates
    const unsubscribeStatus = chatService.onUserStatus((statusData) => {
      console.log('User status update:', statusData);
      
      if (statusData.action === 'ONLINE') {
        setOnlineUsers(prev => new Set(prev).add(statusData.senderId));
      } else if (statusData.action === 'OFFLINE') {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(statusData.senderId);
          return newSet;
        });
      }
    });

    // Listen for errors
    const unsubscribeError = chatService.onError((errorData) => {
      console.error('Chat error:', errorData);
      // You could show a toast notification here
    });

    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
      unsubscribeError();
    };
  }, [connectionStatus]);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    
    // Clear unread count for this user
    setUnreadCounts(prev => ({
      ...prev,
      [user.id.toString()]: 0
    }));
  };

  const handleMessageSent = () => {
    // Refresh unread counts or perform other actions after sending message
    // This callback is called from MessageInput after successfully sending a message
  };

  const handleReconnect = async () => {
    setConnectionStatus('connecting');
    try {
      await chatService.connect();
      setConnectionStatus('connected');
      chatService.joinChat(); // Re-join chat after reconnect
      chatService.sendUserStatus('ONLINE'); // Re-send status
      loadUnreadCounts(); // Reload unread counts
    } catch (error) {
      console.error('Lỗi kết nối lại WebSocket:', error);
      setConnectionStatus('error');
    }
  };

  const ConnectionStatus = () => {
    const getStatusColor = () => {
      switch (connectionStatus) {
        case 'connected': return '#44b700';
        case 'connecting': return '#ff9800';
        case 'error': return '#f44336';
        default: return '#9e9e9e';
      }
    };

    const getStatusText = () => {
      switch (connectionStatus) {
        case 'connected': return 'Đã kết nối';
        case 'connecting': return 'Đang kết nối...';
        case 'error': return 'Lỗi kết nối';
        default: return 'Ngắt kết nối';
      }
    };

    return (
      <Chip
        size="small"
        label={getStatusText()}
        sx={{
          backgroundColor: getStatusColor(),
          color: 'white',
          fontSize: '0.75rem'
        }}
      />
    );
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', p: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={3}>
          <Paper sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              flexShrink: 0,
              backgroundColor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 1
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Trò chuyện ({users?.length || 0})
                </Typography>
                {isLoadingUsers ? (
                  <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                ) : usersError ? (
                  <Chip size="small" label="Lỗi tải" color="error" />
                ) : (
                  <ConnectionStatus />
                )}
              </Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f5f5f5'
                  }
                }}
              />
            </Box>
            <List sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 0,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '3px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <ListItem 
                      button 
                      selected={selectedUser?.id === user.id}
                      onClick={() => handleUserSelect(user)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)'
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(25, 118, 210, 0.12)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.15)'
                          }
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          invisible={!onlineUsers.has(user.id.toString())}
                          sx={{
                            '& .MuiBadge-badge': {
                              backgroundColor: '#44b700',
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              border: '2px solid white'
                            }
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              bgcolor: user.role === 'ROLE_ADMIN' ? 'primary.main' : 'secondary.main',
                              width: 45,
                              height: 45
                            }}
                          >
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {user.name}
                            </Typography>
                            {unreadCounts[user.id.toString()] > 0 && (
                              <Chip
                                size="small"
                                label={unreadCounts[user.id.toString()]}
                                color="error"
                                sx={{ fontSize: '0.75rem', height: 20, minWidth: 20 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.875rem' }}>
                            {user.code}
                            {onlineUsers.has(user.id.toString()) && (
                              <Typography component="span" sx={{ fontSize: '0.75rem', color: '#44b700', ml: 1 }}>
                                • Online
                              </Typography>
                            )}
                            {user.email && <Box component="span" sx={{ display: 'block', fontSize: '0.75rem' }}>{user.email}</Box>}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredUsers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
              ) : isLoadingUsers ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress size={40} />
                </Box>
              ) : usersError ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}>
                  <Typography color="error" sx={{ mb: 2 }}>{usersError}</Typography>
                  <Button variant="outlined" onClick={fetchUsers}>Thử lại</Button>
                </Box>
              ) : (
                <ListItem>
                  <ListItemText 
                    primary={
                      <Typography color="text.secondary" align="center">
                        Không tìm thấy người dùng
                      </Typography>
                    } 
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={9}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            {connectionStatus === 'connecting' ? (
               <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}>
                 <CircularProgress size={60} />
                 <Typography variant="h6" color="text.secondary">Đang kết nối đến máy chủ chat...</Typography>
               </Box>
            ) : connectionStatus === 'error' ? (
               <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 3, p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" color="error" sx={{ mb: 2 }}>Lỗi kết nối đến máy chủ chat.</Typography>
                  <Button variant="contained" onClick={handleReconnect} size="large">Thử lại</Button>
               </Box>
            ) : (
              selectedUser ? (
                <>
                  <Box sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      invisible={!onlineUsers.has(selectedUser.id.toString())}
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#44b700',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          border: '2px solid white'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48,
                          bgcolor: selectedUser.role === 'ROLE_ADMIN' ? 'primary.main' : 'secondary.main'
                        }}
                      >
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        {selectedUser.name}
                        {onlineUsers.has(selectedUser.id.toString()) && (
                          <Typography component="span" sx={{ fontSize: '0.875rem', color: '#44b700', ml: 1 }}>
                            • Online
                          </Typography>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedUser.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f8f9fa' }}>
                    <MessageList selectedUser={selectedUser} />
                  </Box>
                  <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
                    <MessageInput 
                      selectedUser={selectedUser}
                      onMessageSent={handleMessageSent}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: 'text.secondary'
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Chào mừng đến với Trò chuyện Realtime
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Chọn một người dùng để bắt đầu cuộc trò chuyện
                  </Typography>
                </Box>
              )
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatWindow;