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
  Divider,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  ContactMail as ContactMailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
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
    role: '2',
    address: '',
    gender: '',
    status: 1,
    birthday: null,
    description: null
  });

  const [departments, setDepartments] = useState([]);
  const [positions] = useState([
    { id: 1, name: 'Quản lý' },
    { id: 2, name: 'Nhân viên' }
  ]);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const genderOptions = [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
    { value: 'OTHER', label: 'Khác' }
  ];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getAllDepartments();
        const departmentData = response.data?.content || [];
        setDepartments(departmentData);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
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
      const submitData = {
        ...formData,
        role: '2'
      };
      const response = await staffService.createStaff(submitData);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Thêm nhân viên thành công',
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/staff/management');
        }, 1500);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Không thể thêm nhân viên',
        severity: 'error'
      });
      console.error('Error creating staff:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1976d2', fontWeight: 500 }}>
        Thêm nhân viên mới
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                Thông tin cơ bản
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mã nhân viên"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  required
                  sx={{ bgcolor: 'white' }}
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
                  required
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    label="Giới tính"
                    required
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Ngày sinh"
                    value={formData.birthday}
                    onChange={(newValue) => {
                      setFormData(prev => ({ ...prev, birthday: newValue }))
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        size="small" 
                        sx={{ bgcolor: 'white' }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WorkIcon sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                Thông tin công việc
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Phòng ban</InputLabel>
                  <Select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleFormChange}
                    label="Phòng ban"
                    required
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
                <FormControl fullWidth size="small" sx={{ bgcolor: 'white' }}>
                  <InputLabel>Chức vụ</InputLabel>
                  <Select
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleFormChange}
                    label="Chức vụ"
                    required
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
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={formData.startDate}
                    onChange={(newValue) => {
                      setFormData(prev => ({ ...prev, startDate: newValue }))
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        size="small" 
                        required
                        sx={{ bgcolor: 'white' }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ContactMailIcon sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6" sx={{ color: '#1976d2' }}>
                Thông tin liên hệ
              </Typography>
            </Box>
            <Grid container spacing={2}>
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
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mật khẩu"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  sx={{ bgcolor: 'white' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                  required
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  sx={{ bgcolor: 'white' }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/staff/management')}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Thêm nhân viên
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffCreate;