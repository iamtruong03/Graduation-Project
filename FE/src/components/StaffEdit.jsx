import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import {
  Badge as BadgeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CircleOutlined as StatusIcon,
  Contacts as ContactsIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import staffService from '../services/staffService';

const StaffEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    position: '',
    oldPosition: '',
    email: '',
    phone: '',
    status: ''
  });

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await staffService.getStaffById(id);
        console.log('API Response:', response.data);
        const staffData = response.data;
        setFormData({
          code: staffData.code,
          name: staffData.name,
          department: staffData.departmentId,
          position: '',
          oldPosition: staffData.role,
          email: staffData.email,
          phone: staffData.phoneNumber,
          status: staffData.status
        });
      } catch (error) {
        console.error('Error fetching staff data:', error);
      }
    };
    fetchStaffData();
  }, [id]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await staffService.updateStaff(id, formData);
      navigate('/staff/management');
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Chỉnh sửa thông tin nhân viên
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" /> Thông tin cơ bản
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mã nhân viên"
              name="code"
              value={formData.code}
              disabled
              InputProps={{
                startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tên nhân viên"
              name="name"
              value={formData.name}
              disabled
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="primary" /> Thông tin công việc
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Phòng ban</InputLabel>
              <Select
                value={formData.department}
                label="Phòng ban"
                name="department"
                onChange={handleFormChange}
                startAdornment={<BusinessIcon sx={{ ml: 1, mr: 1, color: 'action.active' }} />}
                sx={{
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              >
                <MenuItem value={1}>Phòng Nhân sự</MenuItem>
                <MenuItem value={2}>Phòng Kỹ thuật</MenuItem>
                <MenuItem value={3}>Phòng Kế toán</MenuItem>
                <MenuItem value={4}>Phòng Marketing</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Chức vụ hiện tại"
              value={formData.oldPosition}
              disabled
              InputProps={{
                startAdornment: <WorkIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Chọn chức vụ mới</InputLabel>
              <Select
                value={formData.position}
                label="Chọn chức vụ mới"
                name="position"
                onChange={handleFormChange}
                startAdornment={<WorkIcon sx={{ ml: 1, mr: 1, color: 'action.active' }} />}
                sx={{
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              >
                <MenuItem value="STAFF">Nhân viên</MenuItem>
                <MenuItem value="MANAGER">Trưởng phòng</MenuItem>
                <MenuItem value="DEPUTY">Phó phòng</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ContactsIcon color="primary" /> Thông tin liên hệ
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              disabled
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              disabled
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={formData.status}
                label="Trạng thái"
                name="status"
                onChange={handleFormChange}
                startAdornment={<StatusIcon sx={{ ml: 1, mr: 1, color: 'action.active' }} />}
                sx={{
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              >
                <MenuItem value={1}>Đang làm việc</MenuItem>
                <MenuItem value={0}>Tạm nghỉ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
              Lưu thay đổi
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StaffEdit;