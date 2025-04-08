import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';

const StaffCreate = () => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    position: '',
    email: '',
    phone: '',
  });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Logic to add new staff
    console.log('New staff added:', formData);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Thêm nhân viên mới
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Mã nhân viên"
            name="code"
            value={formData.code}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Tên nhân viên"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Phòng ban"
            name="department"
            value={formData.department}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Chức vụ"
            name="position"
            value={formData.position}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Thêm nhân viên
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default StaffCreate;