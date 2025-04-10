import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import staffService from '../services/staffService';
import departmentService from '../services/departmentService';
import { useNavigate } from 'react-router-dom';

const StaffCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departmentId: '',
    positionId: '',
    phoneNumber: '',
    email: '',
    password: '',
    startDate: null,
    role: '',
    address: '',
    gender: ''
  });

  const [departments, setDepartments] = useState([]);
  const [positions] = useState([
    { id: 1, name: 'Nhân viên' },
    { id: 2, name: 'Trưởng phòng' },
    { id: 3, name: 'Giám đốc' }
  ]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAllDepartments();
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await staffService.createStaff(formData);
      navigate('/staff/management');
    } catch (error) {
      console.error('Error creating staff:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Thêm nhân viên mới
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Phòng ban</InputLabel>
            <Select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleFormChange}
              label="Phòng ban"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Chức vụ</InputLabel>
            <Select
              name="positionId"
              value={formData.positionId}
              onChange={handleFormChange}
              label="Chức vụ"
            >
              {positions.map((pos) => (
                <MenuItem key={pos.id} value={pos.id}>
                  {pos.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleFormChange}
          />

          <TextField
            fullWidth
            label="Số điện thoại"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleFormChange}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Ngày bắt đầu"
              value={formData.startDate}
              onChange={(newValue) => {
                setFormData(prev => ({ ...prev, startDate: newValue }))
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel>Vai trò</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              label="Vai trò"
            >
              <MenuItem value="nhan vien">Nhân viên</MenuItem>
              <MenuItem value="quan ly">Quản lý</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Địa chỉ"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
          />

          <FormControl fullWidth>
            <InputLabel>Giới tính</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleFormChange}
              label="Giới tính"
            >
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/staff/management')}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Thêm nhân viên
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default StaffCreate;