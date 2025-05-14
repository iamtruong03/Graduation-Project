import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Badge, Divider, IconButton, InputAdornment, TextField } from '@mui/material';
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.post('/user/search', {
          search: searchTerm,
          departmentId: null, // Có thể thêm filter theo phòng ban nếu cần
          positionId: null // Có thể thêm filter theo chức vụ nếu cần
        });
        
        if (response?.data?.content) {
          const currentUserId = localStorage.getItem('code');
          const filteredUsers = response.data.content.filter(user => 
            user.id !== parseInt(currentUserId)
          );
          setUsers(filteredUsers);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
      }
    };

    fetchUsers();
  }, [searchTerm]); // Thêm searchTerm vào dependencies để search realtime
  const [departmentId, setDepartmentId] = useState(null);
  const [cid, setCid] = useState(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        await chatService.connect(); // Đảm bảo kết nối WebSocket thành công
        
        const fetchUserInfo = async () => {
          try {
            const response = await api.get('/user/current-user');
            setDepartmentId(response.data.departmentId);
            setCid(response.data.cid);
          } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
          }
        };
    
        const fetchUsers = async () => {
          try {
            const response = await api.get('/user/list-user-dep');
            console.log('Response from API:', response);
            
            // Kiểm tra response data
            if (response?.data?.data && Array.isArray(response.data.data)) {
              const currentUserId = localStorage.getItem('code');
              const filteredUsers = response.data.data.filter(user => 
                user.id !== parseInt(currentUserId)
              );
              console.log('Filtered users:', filteredUsers);
              setUsers(filteredUsers);
            } else {
              console.error('Không thể lấy danh sách người dùng');
              setUsers([]);
            }
          } catch (error) {
            console.error('Lỗi khi lấy danh sách người dùng:', error);
            setUsers([]);
          }
        };
    
        await fetchUserInfo();
        await fetchUsers();
      } catch (error) {
        console.error('Lỗi khởi tạo chat:', error);
      }
    };
  
    initializeChat();
  
    return () => {
      if (chatService.stompClient) {
        chatService.stompClient.disconnect();
      }
    };
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', p: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={3}>
          <Paper sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Trò chuyện ({users?.length || 0})
              </Typography>
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
            <List sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
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
                        <Avatar 
                          sx={{ 
                            bgcolor: user.role === 'ROLE_ADMIN' ? 'primary.main' : 'secondary.main',
                            width: 45,
                            height: 45
                          }}
                        >
                          {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.875rem' }}>
                            {user.code}
                            {user.email && <Box component="span" sx={{ display: 'block', fontSize: '0.75rem' }}>{user.email}</Box>}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredUsers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))
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
            {selectedUser ? (
              <>
                <Box sx={{ 
                  p: 2, 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Avatar 
                    sx={{ 
                      width: 48, 
                      height: 48,
                      bgcolor: selectedUser.role === 'ROLE_ADMIN' ? 'primary.main' : 'secondary.main'
                    }}
                  >
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      {selectedUser.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedUser.email}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f8f9fa' }}>
                  <MessageList 
                    selectedUser={selectedUser}
                    departmentId={departmentId}
                    cid={cid}
                  />
                </Box>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
                  <MessageInput 
                    selectedUser={selectedUser}
                    departmentId={departmentId}
                    cid={cid}
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
                  Chào mừng đến với Trò chuyện
                </Typography>
                <Typography variant="body1">
                  Chọn một người dùng để bắt đầu cuộc trò chuyện
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