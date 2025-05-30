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
  Grid,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import staffService from '../../services/staffService';
import departmentService from '../../services/departmentService';
import { useNavigate } from 'react-router-dom';

const StaffCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
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
        // Đảm bảo response.data.content là array
        const departmentData = response.data?.content || [];
        setDepartments(departmentData);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]); // Set mảng rỗng nếu có lỗi
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
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Mã nhân viên"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Họ tên"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
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
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
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
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleFormChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Số điện thoại"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleFormChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Ngày bắt đầu"
                value={formData.startDate}
                onChange={(newValue) => {
                  setFormData(prev => ({ ...prev, startDate: newValue }))
                }}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
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
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
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
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
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
      </Paper>
    </Box>
  );
};

export default StaffCreate;