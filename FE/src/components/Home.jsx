import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { useAuth } from '../services/auth';

const Home = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Chào mừng {user?.name || 'Người dùng'} đến với hệ thống
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={user.avatar} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body1">{user.email}</Typography>
              <Typography variant="body2">{user.department}</Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Home;