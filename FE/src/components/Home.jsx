import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';

const Home = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Chào mừng đến với hệ thống
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 64, height: 64 }} />
          <Box>
            <Typography variant="h6">Người dùng</Typography>
            <Typography variant="body1">user@example.com</Typography>
            <Typography variant="body2">Phòng ban mặc định</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home;