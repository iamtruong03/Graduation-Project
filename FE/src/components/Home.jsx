import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';

const Home = () => {
  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Chào mừng đến với hệ thống
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64,
              bgcolor: 'primary.main'
            }}
          >
            {userName ? userName.charAt(0).toUpperCase() : '?'}
          </Avatar>
          <Box>
            <Typography variant="h6">{userName || 'Người dùng'}</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home;